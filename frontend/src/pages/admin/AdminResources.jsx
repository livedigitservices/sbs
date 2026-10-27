import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, Video as VideoIcon, Link2, Youtube, Instagram, Facebook, MessageCircle, ExternalLink } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'
import { RESOURCE_CATEGORY_LABELS } from '../../constants/coreServices'

const PLATFORMS = ['YouTube', 'Instagram', 'Facebook', 'WhatsApp', 'Other']

const EMPTY = { title: '', category: '', type: 'image', url: '', platform: 'YouTube', isActive: true }

const platformIcon = (platform, size = 10) => {
  switch (platform) {
    case 'YouTube': return <Youtube size={size} />
    case 'Instagram': return <Instagram size={size} />
    case 'Facebook': return <Facebook size={size} />
    case 'WhatsApp': return <MessageCircle size={size} />
    default: return <Link2 size={size} />
  }
}

// Cloudinary free/basic plans typically cap video uploads around 100MB and
// images around 10MB — check client-side so users get an immediate, clear
// message instead of a confusing mid-upload connection reset.
const MAX_SIZE_MB = { video: 100, image: 10 }

// Uploads straight to Cloudinary from the browser using a short-lived
// signature from our API, so large image/video files never pass through
// our Vercel serverless function's ~4.5MB request body limit.
const uploadToCloudinary = async (file, resourceType, attempt = 1) => {
  const maxMb = MAX_SIZE_MB[resourceType] || 10
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max allowed is ${maxMb}MB for ${resourceType}s.`)
  }

  const { data: sig } = await api.get(`/resources/upload-signature?resource_type=${resourceType}`)
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.apiKey)
  fd.append('timestamp', sig.timestamp)
  fd.append('signature', sig.signature)
  fd.append('folder', sig.folder)

  let res
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/${resourceType}/upload`, {
      method: 'POST',
      body: fd,
    })
  } catch (networkErr) {
    // fetch() rejects (rather than resolving with a non-ok response) on
    // connection-level failures like ERR_CONNECTION_RESET, DNS errors, etc.
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 1500))
      return uploadToCloudinary(file, resourceType, attempt + 1)
    }
    throw new Error('Upload connection was interrupted. This usually happens with large files on an unstable connection — check your internet and try again, or try a smaller file.')
  }

  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message || 'Upload failed')
  return json.secure_url
}

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, resource: null })
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/resources/all')
      .then(r => setResources(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  // Every category gets its own section, in RESOURCE_CATEGORY_LABELS order,
  // even if it has no resources yet. Anything left over with an old/unmatched
  // category (from before categories were locked to this list) is grouped
  // at the end.
  const grouped = useMemo(() => {
    const byCategory = new Map()
    resources.forEach(r => {
      const key = r.category || ''
      if (!byCategory.has(key)) byCategory.set(key, [])
      byCategory.get(key).push(r)
    })

    const groups = RESOURCE_CATEGORY_LABELS.map(label => [label, byCategory.get(label) || []])
    byCategory.forEach((items, key) => {
      if (!RESOURCE_CATEGORY_LABELS.includes(key)) groups.push([key || 'Uncategorized', items])
    })
    return groups
  }, [resources])

  const openAdd = () => { setForm(EMPTY); setFile(null); setModal({ open: true, resource: null }) }
  const openEdit = (resource) => {
    setForm({
      title: resource.title,
      category: resource.category || '',
      type: resource.type,
      url: resource.type === 'link' ? resource.url : '',
      platform: resource.platform || 'YouTube',
      isActive: resource.isActive,
    })
    setFile(null)
    setModal({ open: true, resource })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.category.trim()) {
      toast.error('Please choose or enter a category')
      return
    }
    if (form.type === 'link') {
      if (!form.url.trim()) {
        toast.error('Please enter the social media link URL')
        return
      }
    } else if (!modal.resource && !file) {
      toast.error('Please choose an image or video file')
      return
    }

    setSaving(true)
    try {
      let url = form.url.trim()
      let platform = form.platform

      if (form.type !== 'link') {
        platform = ''
        if (file) {
          setUploading(true)
          try {
            url = await uploadToCloudinary(file, form.type)
          } finally {
            setUploading(false)
          }
        } else if (modal.resource) {
          url = modal.resource.url
        }
      }

      const payload = {
        title: form.title,
        category: form.category.trim(),
        type: form.type,
        url,
        platform,
        isActive: form.isActive,
      }

      if (modal.resource) await api.put(`/resources/${modal.resource._id}`, payload)
      else await api.post('/resources', payload)
      toast.success(modal.resource ? 'Resource updated' : 'Resource added')
      setModal({ open: false, resource: null })
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this resource?')) return
    await api.delete(`/resources/${id}`)
    toast.success('Resource removed')
    load()
  }

  const inputClass = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-accent/60"

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-theme-primary font-bold text-lg">Associate Resources</h1>
          <p className="text-theme-muted text-xs mt-0.5">Upload images, videos, or social links for each service</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition shrink-0">
          <Plus size={16} /> Add Resource
        </button>
      </div>

      {/* Grouped by category */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-theme-card border border-theme rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([category, items]) => (
            <div key={category}>
              <h2 className="text-theme-primary font-bold text-sm mb-3 flex items-center gap-2">
                {category}
                <span className="text-theme-muted font-normal text-xs">({items.length})</span>
              </h2>
              {items.length === 0 ? (
                <div className="bg-theme-card border border-dashed border-theme rounded-2xl p-5 text-theme-muted text-xs">
                  No resources yet for this service.
                </div>
              ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {items.map(r => (
                  <div key={r._id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden flex flex-col">
                    <div className="relative h-32 sm:h-36 bg-black/20 overflow-hidden">
                      {r.type === 'video' ? (
                        <video src={r.url} className="w-full h-full object-cover" muted />
                      ) : r.type === 'image' ? (
                        <img src={r.url} alt={r.title} className="w-full h-full object-cover" />
                      ) : (
                        <a href={r.url} target="_blank" rel="noreferrer"
                          className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-theme-secondary hover:text-accent transition">
                          {platformIcon(r.platform, 22)}
                          <span className="text-[11px] font-semibold flex items-center gap-1">Open link <ExternalLink size={10} /></span>
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
                      <p className="text-theme-primary font-semibold text-xs line-clamp-1">{r.title}</p>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-accent/10 hover:text-accent text-theme-muted transition">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-red-500/10 hover:text-red-400 text-theme-muted transition">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-theme">
              <h3 className="text-theme-primary font-bold">{modal.resource ? 'Edit Resource' : 'Add New Resource'}</h3>
              <button onClick={() => setModal({ open: false, resource: null })} className="text-theme-muted hover:text-theme-primary p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Title</label>
                <input type="text" placeholder="e.g. Diwali Offer Poster" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inputClass} required />
              </div>

              <div>
                <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Service / Category</label>
                <select value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className={inputClass} required>
                  <option value="" disabled>Select a service</option>
                  {RESOURCE_CATEGORY_LABELS.map(label => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Resource Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
                    { key: 'video', label: 'Video', icon: <VideoIcon size={14} /> },
                    { key: 'link', label: 'Social Link', icon: <Link2 size={14} /> },
                  ].map(opt => (
                    <button type="button" key={opt.key}
                      onClick={() => setForm(f => ({ ...f, type: opt.key }))}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-semibold transition ${form.type === opt.key ? 'border-accent text-accent bg-accent/10' : 'border-theme text-theme-secondary hover:border-theme-gold'}`}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {form.type === 'link' ? (
                <>
                  <div>
                    <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Platform</label>
                    <select value={form.platform}
                      onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                      className={inputClass}>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Link URL</label>
                    <input type="url" placeholder="https://youtube.com/..." value={form.url}
                      onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                      className={inputClass} required />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">File ({form.type})</label>
                  <label className="flex items-center gap-3 p-3 border border-dashed border-theme rounded-xl cursor-pointer hover:border-accent/40 transition input-bg">
                    <Upload size={16} className="text-theme-muted shrink-0" />
                    <span className="text-theme-secondary text-sm truncate">
                      {file ? file.name : (modal.resource && modal.resource.type !== 'link' ? 'Replace existing file' : `Upload an ${form.type}`)}
                    </span>
                    <input type="file" accept={form.type === 'video' ? 'video/*' : 'image/*'} onChange={e => setFile(e.target.files[0])} className="hidden" />
                  </label>
                  {modal.resource?.url && modal.resource.type !== 'link' && !file && (
                    <a href={modal.resource.url} target="_blank" rel="noreferrer"
                      className="inline-block mt-1.5 text-xs text-accent hover:underline">
                      View current file
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-accent" />
                <label htmlFor="isActive" className="text-theme-secondary text-sm">Visible to associates</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal({ open: false, resource: null })}
                  className="flex-1 py-3 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-gold transition text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-accent text-accent-contrast font-bold hover:bg-accent-hover transition text-sm disabled:opacity-70">
                  {uploading ? 'Uploading file...' : saving ? 'Saving...' : modal.resource ? 'Update Resource' : 'Add Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}