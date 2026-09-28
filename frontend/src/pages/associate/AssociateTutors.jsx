import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, X, Phone, Mail, User } from 'lucide-react'
import { associateApi } from '../../api'
import toast from 'react-hot-toast'

// Associate Portal — Tutor management (lives at /associate/tutors). Mirrors the Admin panel's tutor
// listing manager exactly (same fields, same save/delete flow), just
// authenticated as an associate instead of an admin.
const EMPTY = { name: '', subjects: '', levels: '', languages: '', profileInfo: '', contactPhone: '', contactEmail: '', isActive: true, order: 0 }

const toCsv = (arr) => (arr || []).join(', ')

export default function AssociateTutors() {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, tutor: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    associateApi.get('/tutors/all')
      .then(r => setTutors(r.data))
      .catch(() => toast.error('Failed to load tutors'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, tutor: null }) }
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
    setModal({ open: true, tutor })
  }
  const closeModal = () => setModal({ open: false, tutor: null })

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Please enter a name')
    if (!form.contactPhone.trim() && !form.contactEmail.trim()) {
      return toast.error('Add at least a phone number or an email so visitors can get in touch')
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        imageUrl: modal.tutor?.imageUrl || '',
        subjects: form.subjects,
        levels: form.levels,
        languages: form.languages,
        profileInfo: form.profileInfo,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        isActive: form.isActive,
        order: Number(form.order) || 0,
      }

      if (modal.tutor) await associateApi.put(`/tutors/${modal.tutor._id}`, payload)
      else await associateApi.post('/tutors', payload)
      toast.success(modal.tutor ? 'Tutor updated' : 'Tutor added')
      closeModal()
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this tutor listing?')) return
    try {
      await associateApi.delete(`/tutors/${id}`)
      toast.success('Tutor removed')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete')
    }
  }

  const inputClass = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#FFD700]/60"
  const labelClass = "text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block"

  return (
    <div >
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-[#2563EB] text-[#fefafa] font-bold px-4 py-2.5 rounded-xl hover:bg-[#1357eb] transition text-sm">
            <Plus size={16} /> Add Tutor
          </button>
        </div>
      </div>
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between p-5 border-b border-theme sticky top-0 bg-theme-secondary">
              <h3 className="text-theme-primary font-bold">{modal.tutor ? 'Edit Tutor' : 'Add New Tutor'}</h3>
              <button onClick={closeModal} className="text-theme-muted hover:text-theme-primary p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" placeholder="e.g. Priya Sharma" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass} />
              </div>

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
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-gold transition text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#2563EB] text-[#f0f0f0] font-bold hover:bg-[#1759e8] transition text-sm disabled:opacity-70">
                  {saving ? 'Saving...' : modal.tutor ? 'Update Tutor' : 'Add Tutor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}