import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, Video as VideoIcon, Link2, Youtube, Instagram, Facebook, MessageCircle, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const EMPTY = { type: 'image', url: '', isActive: true }

const platformIcon = (platform, size = 10) => {
  switch (platform) {
    case 'YouTube': return <Youtube size={size} />
    case 'Instagram': return <Instagram size={size} />
    case 'Facebook': return <Facebook size={size} />
    case 'WhatsApp': return <MessageCircle size={size} />
    default: return <Link2 size={size} />
  }
}

// The platform is worked out from the link itself, so the admin never has to pick it.
const detectPlatform = (url) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase()
    if (host.includes('youtube.com') || host === 'youtu.be') return 'YouTube'
    if (host.includes('instagram.com')) return 'Instagram'
    if (host.includes('facebook.com') || host === 'fb.com' || host === 'fb.watch') return 'Facebook'
    if (host === 'wa.me' || host.includes('whatsapp.com')) return 'WhatsApp'
    return 'Other'
  } catch {
    return 'Other'
  }
}

const hostOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

// Accepts "youtube.com/..." as well as "https://youtube.com/..." and returns a
// clean http(s) URL, or '' when the value is not a usable link.
const normalizeUrl = (value) => {
  const raw = (value || '').trim()
  if (!raw || /\s/.test(raw)) return ''
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`
  try {
    const u = new URL(withScheme)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return ''
    if (!u.hostname.includes('.')) return ''
    return u.toString()
  } catch {
    return ''
  }
}

const formatDate = (iso) => {
  const d = new Date(iso)
  return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`

// Cloudinary free/basic plans typically cap video uploads around 100MB and
// images around 10MB — check client-side so users get an immediate, clear
// message instead of a confusing mid-upload connection reset.
const MAX_SIZE_MB = { video: 100, image: 10 }

const validateFile = (file, type) => {
  if (!file.type.startsWith(`${type}/`)) {
    return `"${file.name}" is not a ${type} file.`
  }
  const maxMb = MAX_SIZE_MB[type] || 10
  if (file.size > maxMb * 1024 * 1024) {
    return `"${file.name}" is too large (${formatSize(file.size)}). Max allowed is ${maxMb}MB for ${type}s.`
  }
  return ''
}

const newestFirst = (a, b) => {
  const diff = new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  if (diff !== 0) return diff
  return String(b._id).localeCompare(String(a._id))
}

// XHR (not fetch) so we can report real upload progress and cancel mid-upload.
const xhrUpload = (endpoint, formData, onProgress, signal) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', endpoint)
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
  }
  xhr.onload = () => {
    let json = {}
    try { json = JSON.parse(xhr.responseText) } catch { /* non-JSON error body */ }
    if (xhr.status >= 200 && xhr.status < 300 && json.secure_url) resolve(json.secure_url)
    else reject(new Error(json.error?.message || `Upload failed (status ${xhr.status})`))
  }
  xhr.onerror = () => { const e = new Error('network'); e.network = true; reject(e) }
  xhr.onabort = () => { const e = new Error('Upload cancelled'); e.cancelled = true; reject(e) }
  if (signal) {
    if (signal.aborted) { xhr.abort(); return }
    signal.addEventListener('abort', () => xhr.abort(), { once: true })
  }
  xhr.send(formData)
})

// Uploads straight to Cloudinary from the browser using a short-lived
// signature from our API, so large image/video files never pass through
// our Vercel serverless function's ~4.5MB request body limit.
const uploadToCloudinary = async (file, resourceType, { onProgress, signal }, attempt = 1) => {
  const { data: sig } = await api.get(`/resources/upload-signature?resource_type=${resourceType}`)
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.apiKey)
  fd.append('timestamp', sig.timestamp)
  fd.append('signature', sig.signature)
  fd.append('folder', sig.folder)

  try {
    return await xhrUpload(`https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`, fd, onProgress, signal)
  } catch (err) {
    // Connection-level failures (ERR_CONNECTION_RESET, DNS, offline...) get one retry
    // with a fresh signature.
    if (err.network) {
      if (attempt < 2 && !signal?.aborted) {
        await new Promise(r => setTimeout(r, 1500))
        onProgress(0)
        return uploadToCloudinary(file, resourceType, { onProgress, signal }, attempt + 1)
      }
      throw new Error('Upload connection was interrupted. This usually happens with large files on an unstable connection — check your internet and try again, or try a smaller file.')
    }
    throw err
  }
}

const errorMessage = (err, fallback) => err?.response?.data?.message || err?.message || fallback

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modal, setModal] = useState({ open: false, resource: null })
  const [form, setForm] = useState(EMPTY)
  const [files, setFiles] = useState([])
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [progress, setProgress] = useState(null) // { index, total, percent }
  const [deletingId, setDeletingId] = useState(null)
  const abortRef = useRef(null)

  const load = () => {
    setLoading(true)
    setLoadError('')
    api.get('/resources/all')
      .then(r => setResources(r.data))
      .catch(err => setLoadError(errorMessage(err, 'Could not load media')))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  // Newest first, regardless of any legacy title / category on older records.
  const sorted = useMemo(() => [...resources].sort(newestFirst), [resources])

  // Thumbnails for the files chosen in the modal (revoked when they change).
  const previews = useMemo(
    () => files.map(f => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null)),
    [files]
  )
  useEffect(() => () => previews.forEach(u => u && URL.revokeObjectURL(u)), [previews])

  const closeModal = () => {
    abortRef.current?.abort()
    setModal({ open: false, resource: null })
    setFormError('')
    setProgress(null)
  }

  const openAdd = () => {
    setForm(EMPTY); setFiles([]); setFormError(''); setProgress(null)
    setModal({ open: true, resource: null })
  }
  const openEdit = (resource) => {
    setForm({
      type: resource.type,
      url: resource.type === 'link' ? resource.url : '',
      isActive: resource.isActive,
    })
    setFiles([]); setFormError(''); setProgress(null)
    setModal({ open: true, resource })
  }

  const handleFilesChosen = (e) => {
    const picked = Array.from(e.target.files || [])
    e.target.value = '' // lets the same file be chosen again after removing it
    if (picked.length === 0) return
    for (const f of picked) {
      const problem = validateFile(f, form.type)
      if (problem) { setFormError(problem); return }
    }
    setFormError('')
    setFiles(modal.resource ? picked.slice(0, 1) : picked)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (saving) return
    const editing = modal.resource
    const isLink = form.type === 'link'

    let linkUrl = ''
    if (isLink) {
      linkUrl = normalizeUrl(form.url)
      if (!linkUrl) {
        setFormError('Please enter a valid link, e.g. https://youtube.com/watch?v=...')
        return
      }
    } else {
      const keepsExistingFile = editing && editing.type === form.type
      if (files.length === 0 && !keepsExistingFile) {
        setFormError(editing ? `Please choose a new ${form.type} file.` : `Please choose at least one ${form.type} file.`)
        return
      }
      for (const f of files) {
        const problem = validateFile(f, form.type)
        if (problem) { setFormError(problem); return }
      }
    }

    setFormError('')
    setSaving(true)
    const controller = new AbortController()
    abortRef.current = controller
    let done = 0
    const total = Math.max(files.length, 1)

    try {
      if (isLink) {
        let platform = detectPlatform(linkUrl)
        if (editing && editing.type === 'link' && editing.url === linkUrl && platform === 'Other') {
          platform = editing.platform || 'Other'
        }
        const payload = { type: 'link', url: linkUrl, platform, isActive: form.isActive }
        if (editing) await api.put(`/resources/${editing._id}`, payload)
        else await api.post('/resources', payload)
        done = 1
      } else if (editing) {
        let url = editing.url
        if (files.length > 0) {
          setProgress({ index: 1, total: 1, percent: 0 })
          url = await uploadToCloudinary(files[0], form.type, {
            signal: controller.signal,
            onProgress: percent => setProgress({ index: 1, total: 1, percent }),
          })
        }
        await api.put(`/resources/${editing._id}`, { type: form.type, url, platform: '', isActive: form.isActive })
        done = 1
      } else {
        for (const file of files) {
          setProgress({ index: done + 1, total, percent: 0 })
          const url = await uploadToCloudinary(file, form.type, {
            signal: controller.signal,
            onProgress: percent => setProgress({ index: done + 1, total, percent }),
          })
          await api.post('/resources', { type: form.type, url, platform: '', isActive: form.isActive })
          done += 1
        }
      }

      toast.success(editing ? 'Media updated' : done > 1 ? `${done} items added` : 'Media added')
      setModal({ open: false, resource: null })
      load()
    } catch (err) {
      if (err.cancelled) {
        if (done > 0) { toast.success(`${done} of ${total} uploaded before cancelling`); load() }
      } else {
        const message = errorMessage(err, 'Failed to save')
        if (done > 0) {
          // Keep the files that did not make it so the admin can simply press save again.
          setFiles(files.slice(done))
          setFormError(`${done} of ${total} uploaded. Then failed: ${message}`)
          load()
        } else {
          setFormError(message)
        }
        toast.error(message)
      }
    } finally {
      abortRef.current = null
      setSaving(false)
      setProgress(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this media? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await api.delete(`/resources/${id}`)
      toast.success('Media removed')
      setResources(list => list.filter(r => r._id !== id))
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete'))
    } finally {
      setDeletingId(null)
    }
  }

  const inputClass = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-accent/60"
  const editing = modal.resource
  const isLink = form.type === 'link'

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-theme-primary font-bold text-lg">Associate Resources</h1>
          <p className="text-theme-muted text-xs mt-0.5">Add images, videos, or links — newest appear first on the website</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition shrink-0">
          <Plus size={16} /> Add Media
        </button>
      </div>

      {/* Media list, newest first */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-theme-card border border-theme rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      ) : loadError ? (
        <div className="bg-theme-card border border-theme rounded-2xl p-8 text-center">
          <AlertCircle size={28} className="mx-auto mb-2 text-red-400" />
          <p className="text-theme-secondary text-sm mb-3">{loadError}</p>
          <button onClick={load} className="px-4 py-2 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-gold transition text-sm font-semibold">
            Try again
          </button>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-theme-card border border-dashed border-theme rounded-2xl p-10 text-center text-theme-muted text-sm">
          No media yet. Click “Add Media” to upload an image, video or link.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sorted.map(r => (
            <div key={r._id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-32 sm:h-36 bg-black/20 overflow-hidden">
                {r.type === 'video' ? (
                  <video src={r.url} className="w-full h-full object-cover" muted preload="metadata" />
                ) : r.type === 'image' ? (
                  <img src={r.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <a href={r.url} target="_blank" rel="noopener noreferrer"
                    className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-theme-secondary hover:text-accent transition px-2">
                    {platformIcon(r.platform, 22)}
                    <span className="text-[11px] font-semibold flex items-center gap-1">Open link <ExternalLink size={10} /></span>
                    <span className="text-[10px] text-theme-muted max-w-full truncate">{hostOf(r.url)}</span>
                  </a>
                )}
                <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  {r.type === 'video' ? <VideoIcon size={9} /> : r.type === 'image' ? <ImageIcon size={9} /> : platformIcon(r.platform, 9)}
                  {r.type === 'link' ? (r.platform || 'link') : r.type}
                </span>
                <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${r.isActive ? 'bg-success/90 text-white' : 'bg-red-500/90 text-white'}`}>
                  {r.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="p-2.5 flex items-center justify-between gap-2">
                <p className="text-theme-muted text-[11px]">{formatDate(r.createdAt)}</p>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(r)} aria-label="Edit media" disabled={deletingId === r._id}
                    className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-accent/10 hover:text-accent text-theme-muted transition disabled:opacity-50">
                    <Edit size={12} />
                  </button>
                  <button onClick={() => handleDelete(r._id)} aria-label="Delete media" disabled={deletingId === r._id}
                    className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-red-500/10 hover:text-red-400 text-theme-muted transition disabled:opacity-50">
                    {deletingId === r._id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-theme">
              <h3 className="text-theme-primary font-bold">{editing ? 'Edit Media' : 'Add Media'}</h3>
              <button type="button" onClick={closeModal} aria-label="Close" className="text-theme-muted hover:text-theme-primary p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
                    { key: 'video', label: 'Video', icon: <VideoIcon size={14} /> },
                    { key: 'link', label: 'Link', icon: <Link2 size={14} /> },
                  ].map(opt => (
                    <button type="button" key={opt.key} disabled={saving}
                      onClick={() => { setForm(f => ({ ...f, type: opt.key })); setFiles([]); setFormError('') }}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition disabled:opacity-60 ${form.type === opt.key ? 'border-accent text-accent bg-accent/10' : 'border-theme text-theme-secondary hover:border-theme-gold'}`}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {isLink ? (
                <div>
                  <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Link URL</label>
                  <input type="text" inputMode="url" autoComplete="off" placeholder="https://youtube.com/..." value={form.url}
                    onChange={e => { setForm(f => ({ ...f, url: e.target.value })); setFormError('') }}
                    disabled={saving} className={inputClass} />
                </div>
              ) : (
                <div>
                  <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">
                    {editing ? `Replace ${form.type} (optional)` : `${form.type === 'image' ? 'Images' : 'Videos'}`}
                  </label>
                  <label className={`flex items-center gap-3 p-3 border border-dashed border-theme rounded-xl transition input-bg ${saving ? 'opacity-60' : 'cursor-pointer hover:border-accent/40'}`}>
                    <Upload size={16} className="text-theme-muted shrink-0" />
                    <span className="text-theme-secondary text-sm truncate">
                      {files.length > 0
                        ? `${files.length} ${form.type}${files.length > 1 ? 's' : ''} selected — click to change`
                        : editing && editing.type === form.type
                          ? `Choose a new ${form.type} to replace the current one`
                          : `Choose ${editing ? 'a' : ''} ${form.type}${editing ? '' : ' file(s)'} to upload`}
                    </span>
                    <input type="file" accept={`${form.type}/*`} multiple={!editing} disabled={saving}
                      onChange={handleFilesChosen} className="hidden" />
                  </label>
                  <p className="text-theme-muted text-[11px] mt-1.5">Max {MAX_SIZE_MB[form.type]}MB per {form.type}.</p>

                  {files.length > 0 && (
                    <ul className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center gap-2.5 p-1.5 rounded-lg bg-theme-tertiary">
                          {previews[i]
                            ? <img src={previews[i]} alt="" className="w-9 h-9 rounded object-cover shrink-0" />
                            : <span className="w-9 h-9 rounded bg-black/20 flex items-center justify-center shrink-0 text-theme-muted"><VideoIcon size={14} /></span>}
                          <span className="min-w-0 flex-1">
                            <span className="block text-theme-primary text-xs truncate">{f.name}</span>
                            <span className="block text-theme-muted text-[10px]">{formatSize(f.size)}</span>
                          </span>
                          <button type="button" disabled={saving} aria-label={`Remove ${f.name}`}
                            onClick={() => setFiles(list => list.filter((_, idx) => idx !== i))}
                            className="p-1 text-theme-muted hover:text-red-400 disabled:opacity-50"><X size={14} /></button>
                        </li>
                      ))}
                    </ul>
                  )}

                  {editing?.url && editing.type === form.type && files.length === 0 && (
                    <a href={editing.url} target="_blank" rel="noopener noreferrer"
                      className="inline-block mt-1.5 text-xs text-accent hover:underline">
                      View current file
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} disabled={saving}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-accent" />
                <label htmlFor="isActive" className="text-theme-secondary text-sm">Visible on the website</label>
              </div>

              {progress && (
                <div role="status" aria-live="polite">
                  <div className="flex justify-between text-xs text-theme-secondary mb-1">
                    <span>{progress.total > 1 ? `Uploading ${progress.index} of ${progress.total}…` : 'Uploading…'}</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-theme-tertiary overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-200" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>
              )}

              {formError && (
                <div role="alert" className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-gold transition text-sm font-semibold">
                  {saving && progress ? 'Cancel upload' : 'Cancel'}
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-accent text-accent-contrast font-bold hover:bg-accent-hover transition text-sm disabled:opacity-70 flex items-center justify-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {saving ? (progress ? 'Uploading…' : 'Saving…') : editing ? 'Update' : files.length > 1 ? `Add ${files.length} items` : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}