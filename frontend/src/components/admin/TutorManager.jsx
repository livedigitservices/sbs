import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Upload, Phone, Mail, User } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const EMPTY = { name: '', subjects: '', levels: '', languages: '', profileInfo: '', contactPhone: '', contactEmail: '', isActive: true, order: 0 }
const MAX_IMAGE_MB = 10

// Uploads the tutor photo straight to Cloudinary from the browser using a
// short-lived signature from our API, bypassing Vercel's ~4.5MB serverless
// body limit — same approach as the Poster upload flow.
const uploadToCloudinary = async (file, attempt = 1) => {
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max allowed is ${MAX_IMAGE_MB}MB.`)
  }

  const { data: sig } = await api.get('/tutors/upload-signature')
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

const toCsv = (arr) => (arr || []).join(', ')

export default function TutorManager() {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, tutor: null })
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/tutors/all')
      .then(r => setTutors(r.data))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => { setForm(EMPTY); setFile(null); setModal({ open: true, tutor: null }) }
  const openEdit = (tutor) => {
    setForm({
      name: tutor.name || '',
      subjects: toCsv(tutor.subjects),
      levels: toCsv(tutor.levels),
      languages: toCsv(tutor.languages),
      profileInfo: tutor.profileInfo || '',
      contactPhone: tutor.contactPhone || '',
      contactEmail: tutor.contactEmail || '',
      isActive: tutor.isActive,
      order: tutor.order || 0,
    })
    setFile(null)
    setModal({ open: true, tutor })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Please enter a name')
    if (!form.contactPhone.trim() && !form.contactEmail.trim()) {
      return toast.error('Add at least a phone number or an email so visitors can get in touch')
    }

    setSaving(true)
    try {
      let imageUrl = modal.tutor?.imageUrl || ''
      if (file) {
        setUploading(true)
        try {
          imageUrl = await uploadToCloudinary(file)
        } finally {
          setUploading(false)
        }
      }

      const payload = {
        name: form.name,
        imageUrl,
        subjects: form.subjects,
        levels: form.levels,
        languages: form.languages,
        profileInfo: form.profileInfo,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        isActive: form.isActive,
        order: Number(form.order) || 0,
      }

      if (modal.tutor) await api.put(`/tutors/${modal.tutor._id}`, payload)
      else await api.post('/tutors', payload)
      toast.success(modal.tutor ? 'Listing updated' : 'Listing added')
      setModal({ open: false, tutor: null })
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return
    await api.delete(`/tutors/${id}`)
    toast.success('Listing removed')
    load()
  }

  const inputClass = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-accent/60"
  const labelClass = "text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-theme-primary font-bold text-lg">Online Tutors / Mentors</h1>
          <p className="text-theme-muted text-xs mt-0.5">Manage listings shown on the public "Find your Online Tutor" page</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-accent-contrast font-bold text-sm hover:bg-accent-hover transition shrink-0">
          <Plus size={16} /> Add Listing
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-theme-card border border-theme rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className="bg-theme-card border border-dashed border-theme rounded-2xl p-5 text-theme-muted text-xs">
          No listings yet. Click "Add Listing" to publish the first one.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {tutors.map(t => (
            <div key={t._id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden flex flex-col">
              <div className="relative h-32 sm:h-36 bg-black/20 overflow-hidden">
                {t.imageUrl ? (
                  <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-theme-tertiary">
                    <User size={28} className="text-theme-muted" />
                    <span className="text-theme-muted text-[9px]">No Photo</span>
                  </div>
                )}
                <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${t.isActive ? 'bg-success/90 text-white' : 'bg-red-500/90 text-white'}`}>
                  {t.isActive ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="p-2.5 flex flex-col gap-1 flex-1">
                <p className="text-theme-primary font-semibold text-xs line-clamp-1">{t.name}</p>
                {t.subjects?.length > 0 && (
                  <p className="text-theme-muted text-[10px] line-clamp-1">Subjects: {toCsv(t.subjects)}</p>
                )}
                {t.levels?.length > 0 && (
                  <p className="text-theme-muted text-[10px] line-clamp-1">Levels: {toCsv(t.levels)}</p>
                )}
                {t.languages?.length > 0 && (
                  <p className="text-theme-muted text-[10px] line-clamp-1">Languages: {toCsv(t.languages)}</p>
                )}
                <div className="flex gap-1 mt-auto pt-1.5">
                  <button onClick={() => openEdit(t)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-theme-tertiary hover:bg-accent/10 hover:text-accent text-theme-muted transition text-[11px]">
                    <Edit size={12} /> Edit
                  </button>
                  <button onClick={() => handleDelete(t._id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-theme-tertiary hover:bg-red-500/10 hover:text-red-400 text-theme-muted transition text-[11px]">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between p-5 border-b border-theme sticky top-0 bg-theme-secondary">
              <h3 className="text-theme-primary font-bold">{modal.tutor ? 'Edit Listing' : 'Add New Listing'}</h3>
              <button onClick={() => setModal({ open: false, tutor: null })} className="text-theme-muted hover:text-theme-primary p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" placeholder="e.g. Priya Sharma" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass} />
              </div>

              {/* <div>
                <label className={labelClass}>Photo (optional)</label>
                <label className="flex items-center gap-3 p-3 border border-dashed border-theme rounded-xl cursor-pointer hover:border-accent/40 transition input-bg">
                  <Upload size={16} className="text-theme-muted shrink-0" />
                  <span className="text-theme-secondary text-sm truncate">
                    {file ? file.name : (modal.tutor ? 'Replace existing photo' : 'Upload a photo (optional)')}
                  </span>
                  <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} className="hidden" />
                </label>
                {modal.tutor?.imageUrl && !file && (
                  <a href={modal.tutor.imageUrl} target="_blank" rel="noreferrer"
                    className="inline-block mt-1.5 text-xs text-accent hover:underline">
                    View current photo
                  </a>
                )}
              </div> */}

              <div>
                <label className={labelClass}>Subject/s</label>
                <input type="text" placeholder="e.g. Maths, Physics, Spoken English" value={form.subjects}
                  onChange={e => setForm(f => ({ ...f, subjects: e.target.value }))}
                  className={inputClass} />
                <p className="text-theme-muted text-[11px] mt-1">Comma-separated. Shown as filter options on the public page.</p>
              </div>

              <div>
                <label className={labelClass}>Level/s</label>
                <input type="text" placeholder="e.g. Beginner, School, Undergraduate" value={form.levels}
                  onChange={e => setForm(f => ({ ...f, levels: e.target.value }))}
                  className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Language/s</label>
                <input type="text" placeholder="e.g. English, Hindi, Telugu" value={form.languages}
                  onChange={e => setForm(f => ({ ...f, languages: e.target.value }))}
                  className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Profile / More Info</label>
                <textarea rows={3} placeholder="Short bio, experience, qualifications..." value={form.profileInfo}
                  onChange={e => setForm(f => ({ ...f, profileInfo: e.target.value }))}
                  className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}><Phone size={11} className="inline mr-1 -mt-0.5" />Contact Phone</label>
                  <input type="text" placeholder="e.g. +91 98765 43210" value={form.contactPhone}
                    onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}><Mail size={11} className="inline mr-1 -mt-0.5" />Contact Email</label>
                  <input type="email" placeholder="e.g. priya@example.com" value={form.contactEmail}
                    onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                    className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Display Order</label>
                <input type="number" value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                  className={inputClass} />
                <p className="text-theme-muted text-[11px] mt-1">Lower numbers show first. Leave as 0 for default (newest first).</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-accent" />
                <label htmlFor="isActive" className="text-theme-secondary text-sm">Published (visible to site visitors)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal({ open: false, tutor: null })}
                  className="flex-1 py-3 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-gold transition text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-accent text-accent-contrast font-bold hover:bg-accent-hover transition text-sm disabled:opacity-70">
                  {uploading ? 'Uploading photo...' : saving ? 'Saving...' : modal.tutor ? 'Update Listing' : 'Add Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}