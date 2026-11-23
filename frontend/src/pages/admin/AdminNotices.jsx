import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const EMPTY = { text: '', link: '', isActive: true, order: 0 }

export default function AdminNotices() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, notice: null })
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/notices/all')
      .then(r => setNotices(r.data))
      .catch(() => toast.error('Failed to load notices'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, notice: null }) }
  const openEdit = (n) => {
    setForm({ text: n.text, link: n.link || '', isActive: n.isActive, order: n.order || 0 })
    setModal({ open: true, notice: n })
  }
  const closeModal = () => setModal({ open: false, notice: null })

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.text.trim()) return toast.error('Please enter the notice text')

    setSaving(true)
    try {
      const payload = {
        text: form.text,
        link: form.link,
        isActive: form.isActive,
        order: Number(form.order) || 0,
      }
      if (modal.notice) await api.put(`/notices/${modal.notice._id}`, payload)
      else await api.post('/notices', payload)
      toast.success(modal.notice ? 'Notice updated' : 'Notice added')
      closeModal()
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (n) => {
    try {
      await api.put(`/notices/${n._id}`, { isActive: !n.isActive })
      load()
    } catch {
      toast.error('Failed to update')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this notice?')) return
    try {
      await api.delete(`/notices/${id}`)
      toast.success('Notice removed')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const inputClass = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#2563EB]/60"
  const labelClass = "text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-theme-primary font-bold text-lg">What's New</h1>
          <p className="text-theme-muted text-xs mt-0.5">Manage the notices scrolling on the public home page</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:bg-[#1D4ED8] transition shrink-0">
          <Plus size={16} /> Add Notice
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-theme-card border border-theme rounded-2xl h-16 animate-pulse" />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-theme-card border border-dashed border-theme rounded-2xl p-5 text-theme-muted text-xs">
          No notices yet. Click "Add Notice" to publish the first one.
        </div>
      ) : (
        <div className="space-y-2">
          {notices.map(n => (
            <div key={n._id} className="bg-theme-card border border-theme rounded-2xl p-3.5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-theme-primary text-sm font-medium break-words">{n.text}</p>
                <p className="text-theme-muted text-[11px] mt-1 truncate">
                  {n.link ? `Link: ${n.link}` : 'Default link'} · Order {n.order || 0}
                </p>
              </div>
              <button onClick={() => toggleActive(n)}
                className={`px-2 py-1 rounded-full text-[10px] font-semibold shrink-0 ${n.isActive ? 'bg-[#16A34A]/90 text-white' : 'bg-red-500/90 text-white'}`}>
                {n.isActive ? 'Active' : 'Hidden'}
              </button>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(n)} className="p-2 rounded-lg bg-theme-tertiary hover:bg-[#2563EB]/10 hover:text-[#2563EB] text-theme-muted transition">
                  <Edit size={14} />
                </button>
                <button onClick={() => handleDelete(n._id)} className="p-2 rounded-lg bg-theme-tertiary hover:bg-red-500/10 hover:text-red-400 text-theme-muted transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-theme">
              <h3 className="text-theme-primary font-bold">{modal.notice ? 'Edit Notice' : 'Add New Notice'}</h3>
              <button onClick={closeModal} className="text-theme-muted hover:text-theme-primary p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className={labelClass}>Notice Text</label>
                <textarea rows={3} maxLength={300} placeholder="e.g. 2026 Admissions closing soon, hurry up for last seats"
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  className={`${inputClass} resize-none`} />
                <p className="text-theme-muted text-[11px] mt-1 text-right">{form.text.length}/300</p>
              </div>

              <div>
                <label className={labelClass}>Link (optional)</label>
                <input type="text" placeholder="/tutors or https://example.com" value={form.link}
                  onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                  className={inputClass} />
                <p className="text-theme-muted text-[11px] mt-1">Leave empty to open Associate Resources.</p>
              </div>

              <div>
                <label className={labelClass}>Display Order</label>
                <input type="number" value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                  className={inputClass} />
                <p className="text-theme-muted text-[11px] mt-1">Lower numbers show first. Leave as 0 for newest first.</p>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="noticeActive" checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-[#2563EB]" />
                <label htmlFor="noticeActive" className="text-theme-secondary text-sm">Published (visible to site visitors)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary transition text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#2563EB] text-white font-bold hover:bg-[#1D4ED8] transition text-sm disabled:opacity-70">
                  {saving ? 'Saving...' : modal.notice ? 'Update Notice' : 'Add Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}