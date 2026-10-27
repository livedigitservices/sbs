import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Upload } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const EMPTY = { title: '', isActive: true, order: 0 }
const MAX_IMAGE_MB = 10

// Uploads the poster image straight to Cloudinary from the browser using a
// short-lived signature from our API, bypassing Vercel's ~4.5MB serverless
// body limit — same approach as the Associate Resources upload flow.
const uploadToCloudinary = async (file, attempt = 1) => {
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max allowed is ${MAX_IMAGE_MB}MB.`)
  }

  const { data: sig } = await api.get('/posters/upload-signature')
  const fd = new FormData()
  fd.append('file', file)
  fd.append('api_key', sig.apiKey)
  fd.append('timestamp', sig.timestamp)
  fd.append('signature', sig.signature)
  fd.append('folder', sig.folder)

  let res
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: 'POST',
      body: fd,
    })
  } catch (networkErr) {
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 1500))
      return uploadToCloudinary(file, attempt + 1)
    }
    throw new Error('Upload connection was interrupted. Check your internet and try again.')
  }

  const json = await res.json()
  if (!res.ok) throw new Error(json.error?.message || 'Upload failed')
  return json.secure_url
}

// Reused by AdminVisaPosters and AdminFreelancePosters — identical CRUD UI,
// scoped to whichever `category` ('visa' | 'freelance') is passed in.
export default function PosterManager({ category, title, description }) {
  const [posters, setPosters] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, poster: null })
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = () => {
    setLoading(true)
    api.get(`/posters/${category}/all`)
      .then(r => setPosters(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [category])

  const openAdd = () => { setForm(EMPTY); setFile(null); setModal({ open: true, poster: null }) }
  const openEdit = (poster) => {
    setForm({ title: poster.title || '', isActive: poster.isActive, order: poster.order || 0 })
    setFile(null)
    setModal({ open: true, poster })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!modal.poster && !file) {
      toast.error('Please choose a poster image')
      return
    }

    setSaving(true)
    try {
      let imageUrl = modal.poster?.imageUrl || ''
      if (file) {
        setUploading(true)
        try {
          imageUrl = await uploadToCloudinary(file)
        } finally {
          setUploading(false)
        }
      }

      const payload = {
        category,
        title: form.title,
        imageUrl,
        isActive: form.isActive,
        order: Number(form.order) || 0,
      }

      if (modal.poster) await api.put(`/posters/${modal.poster._id}`, payload)
      else await api.post('/posters', payload)
      toast.success(modal.poster ? 'Poster updated' : 'Poster added')
      setModal({ open: false, poster: null })
      load()
    } catch (err) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this poster?')) return
    await api.delete(`/posters/${id}`)
    toast.success('Poster removed')
    load()
  }

  const inputClass = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#2563EB]/60"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-theme-primary font-bold text-lg">{title}</h1>
          <p className="text-theme-muted text-xs mt-0.5">{description}</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:bg-[#1D4ED8] transition shrink-0">
          <Plus size={16} /> Add Poster
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-theme-card border border-theme rounded-2xl h-44 animate-pulse" />
          ))}
        </div>
      ) : posters.length === 0 ? (
        <div className="bg-theme-card border border-dashed border-theme rounded-2xl p-5 text-theme-muted text-xs">
          No posters yet. Click "Add Poster" to publish the first one.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {posters.map(p => (
            <div key={p._id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-32 sm:h-36 bg-black/20 overflow-hidden">
                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${p.isActive ? 'bg-[#16A34A]/90 text-white' : 'bg-red-500/90 text-white'}`}>
                  {p.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="p-2.5 flex items-center justify-between gap-2">
                <p className="text-theme-primary font-semibold text-xs line-clamp-1">{p.title || 'Untitled poster'}</p>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-theme-muted transition">
                    <Edit size={12} />
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-red-500/10 hover:text-red-400 text-theme-muted transition">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-theme">
              <h3 className="text-theme-primary font-bold">{modal.poster ? 'Edit Poster' : 'Add New Poster'}</h3>
              <button onClick={() => setModal({ open: false, poster: null })} className="text-theme-muted hover:text-theme-primary p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Title (optional)</label>
                <input type="text" placeholder="e.g. Canada Work Visa 2026" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inputClass} />
              </div>

              <div>
                <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Poster Image</label>
                <label className="flex items-center gap-3 p-3 border border-dashed border-theme rounded-xl cursor-pointer hover:border-[#2563EB]/40 transition input-bg">
                  <Upload size={16} className="text-theme-muted shrink-0" />
                  <span className="text-theme-secondary text-sm truncate">
                    {file ? file.name : (modal.poster ? 'Replace existing image' : 'Upload an image')}
                  </span>
                  <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="hidden" />
                </label>
                {modal.poster?.imageUrl && !file && (
                  <a href={modal.poster.imageUrl} target="_blank" rel="noreferrer"
                    className="inline-block mt-1.5 text-xs text-[#2563EB] hover:underline">
                    View current image
                  </a>
                )}
              </div>

              <div>
                <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Display Order</label>
                <input type="number" value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                  className={inputClass} />
                <p className="text-theme-muted text-[11px] mt-1">Lower numbers show first. Leave as 0 for default (newest first).</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#2563EB]" />
                <label htmlFor="isActive" className="text-theme-secondary text-sm">Published (visible to site visitors)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal({ open: false, poster: null })}
                  className="flex-1 py-3 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-gold transition text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#2563EB] text-white font-bold hover:bg-[#1D4ED8] transition text-sm disabled:opacity-70">
                  {uploading ? 'Uploading image...' : saving ? 'Saving...' : modal.poster ? 'Update Poster' : 'Add Poster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}