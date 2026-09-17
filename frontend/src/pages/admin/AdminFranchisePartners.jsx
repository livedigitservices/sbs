import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, X, MapPin, User, Phone, ChevronDown, ChevronUp, Store } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const inputClass = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#FFD700]/60"
const smallInputClass = "w-full input-bg border border-theme rounded-lg px-3 py-2 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#FFD700]/60"

const emptyPerson = () => ({ name: '', phone: '' })
const emptyForm   = () => ({ state: '', order: 0, areas: [''], persons: [emptyPerson()] })

export default function AdminFranchisePartners() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState({ open: false, partner: null })
  const [form, setForm]         = useState(emptyForm())
  const [saving, setSaving]     = useState(false)
  const [expanded, setExpanded] = useState({})

  const load = () => {
    setLoading(true)
    api.get('/franchise-partners').then(r => setPartners(r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => { setForm(emptyForm()); setModal({ open: true, partner: null }) }
  const openEdit = (p) => {
    setForm({
      state: p.state,
      order: p.order || 0,
      areas: p.areas.length ? [...p.areas] : [''],
      persons: p.persons.length ? p.persons.map(x => ({ name: x.name, phone: x.phone })) : [emptyPerson()],
    })
    setModal({ open: true, partner: p })
  }
  const closeModal = () => setModal({ open: false, partner: null })

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const addArea = () => setForm(f => ({ ...f, areas: [...f.areas, ''] }))
  const removeArea = (ai) => setForm(f => ({ ...f, areas: f.areas.filter((_, i) => i !== ai) }))
  const updateArea = (ai, value) => setForm(f => ({
    ...f, areas: f.areas.map((a, i) => i === ai ? value : a)
  }))

  const addPerson = () => setForm(f => ({ ...f, persons: [...f.persons, emptyPerson()] }))
  const removePerson = (pi) => setForm(f => ({ ...f, persons: f.persons.filter((_, i) => i !== pi) }))
  const updatePerson = (pi, field, value) => setForm(f => ({
    ...f, persons: f.persons.map((p, i) => i === pi ? { ...p, [field]: value } : p)
  }))

  const validate = () => {
    if (!form.state.trim()) { toast.error('State name is required'); return false }
    const areas = form.areas.map(a => a.trim()).filter(Boolean)
    if (!areas.length) { toast.error('Add at least one area/pincode'); return false }
    if (!form.persons.length) { toast.error('Add at least one contact person'); return false }
    for (const p of form.persons) {
      if (!p.name.trim() || !p.phone.trim()) { toast.error('Fill name & phone for every contact person'); return false }
    }
    return true
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    const payload = {
      state: form.state.trim(),
      order: Number(form.order) || 0,
      areas: form.areas.map(a => a.trim()).filter(Boolean),
      persons: form.persons.map(p => ({ name: p.name.trim(), phone: p.phone.trim() })),
    }
    try {
      if (modal.partner) await api.put(`/franchise-partners/${modal.partner._id}`, payload)
      else await api.post('/franchise-partners', payload)
      toast.success(modal.partner ? 'Franchise partner card updated' : 'Franchise partner card added')
      closeModal()
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this entire franchise partner card?')) return
    try {
      await api.delete(`/franchise-partners/${id}`)
      toast.success('Deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-theme-primary font-black text-2xl">Franchise Partners</h1>
          <p className="text-theme-secondary text-sm">{partners.length} state{partners.length === 1 ? '' : 's'}</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#FFD700] text-[#0A0A0A] font-bold px-4 py-2.5 rounded-xl hover:bg-[#E6C200] transition text-sm">
          <Plus size={16} /> Add State
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-theme-card border border-theme rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      ) : !partners.length ? (
        <div className="bg-theme-card border border-theme rounded-2xl p-10 text-center text-theme-muted">
          No franchise partner cards yet. Click "Add State" to start.
        </div>
      ) : (
        <div className="space-y-4">
          {partners.map((p) => {
            const isOpen = !!expanded[p._id]
            return (
              <div key={p._id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => toggleExpand(p._id)}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFD700]/10 shrink-0">
                    <Store size={16} className="text-[#FFD700]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-theme-primary font-bold">{p.state}</p>
                    <p className="text-theme-muted text-xs">
                      {p.areas.length} area{p.areas.length === 1 ? '' : 's'} · {p.persons.length} contact{p.persons.length === 1 ? '' : 's'} · order {p.order}
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(p) }}
                    className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-[#FFD700]/10 hover:text-[#FFD700] text-theme-muted transition">
                    <Edit size={13} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p._id) }}
                    className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-red-500/10 hover:text-red-400 text-theme-muted transition">
                    <Trash2 size={13} />
                  </button>
                  {isOpen ? <ChevronUp size={16} className="text-theme-muted" /> : <ChevronDown size={16} className="text-theme-muted" />}
                </div>

                {isOpen && (
                  <div className="border-t border-theme px-5 py-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#FFD700] mb-2">Areas</p>
                      <div className="flex flex-wrap gap-2">
                        {p.areas.map((a, ai) => (
                          <span key={ai} className="text-xs px-2.5 py-1 rounded-lg bg-theme-tertiary text-theme-secondary flex items-center gap-1">
                            <MapPin size={11} className="text-theme-muted" />{a}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#FFD700] mb-2">Contacts</p>
                      <div className="space-y-1.5">
                        {p.persons.map((person, pi) => (
                          <div key={pi} className="flex items-center justify-between text-sm">
                            <span className="text-theme-primary flex items-center gap-1.5"><User size={12} className="text-theme-muted" />{person.name}</span>
                            <span className="text-theme-secondary font-mono flex items-center gap-1.5"><Phone size={12} />{person.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-theme shrink-0">
              <h3 className="text-theme-primary font-bold">{modal.partner ? 'Edit Franchise Partner Card' : 'Add Franchise Partner Card'}</h3>
              <button onClick={closeModal} className="text-theme-muted hover:text-theme-primary p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">State Name</label>
                  <input type="text" placeholder="e.g. Telangana" value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    className={inputClass} required />
                </div>
                <div>
                  <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">Order</label>
                  <input type="number" value={form.order}
                    onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                    className={inputClass} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide">Areas / Pincodes</label>
                  <button type="button" onClick={addArea}
                    className="flex items-center gap-1 text-xs font-semibold text-[#FFD700] hover:text-[#E6C200] transition">
                    <Plus size={13} /> Add Area
                  </button>
                </div>
                <div className="space-y-2">
                  {form.areas.map((a, ai) => (
                    <div key={ai} className="flex items-center gap-2">
                      <input type="text" placeholder="e.g. 508001 / Nalgonda" value={a}
                        onChange={e => updateArea(ai, e.target.value)}
                        className={smallInputClass} required />
                      {form.areas.length > 1 && (
                        <button type="button" onClick={() => removeArea(ai)}
                          className="p-2 rounded-lg text-theme-muted hover:text-red-400 hover:bg-red-500/10 transition shrink-0">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide">Contact Person(s)</label>
                  <button type="button" onClick={addPerson}
                    className="flex items-center gap-1 text-xs font-semibold text-[#FFD700] hover:text-[#E6C200] transition">
                    <Plus size={13} /> Add Contact Person
                  </button>
                </div>
                <div className="space-y-2">
                  {form.persons.map((p, pi) => (
                    <div key={pi} className="flex items-center gap-2">
                      <input type="text" placeholder="Name" value={p.name}
                        onChange={e => updatePerson(pi, 'name', e.target.value)}
                        className={smallInputClass} required />
                      <input type="tel" placeholder="Phone" value={p.phone}
                        onChange={e => updatePerson(pi, 'phone', e.target.value)}
                        className={smallInputClass} required />
                      {form.persons.length > 1 && (
                        <button type="button" onClick={() => removePerson(pi)}
                          className="p-2 rounded-lg text-theme-muted hover:text-red-400 hover:bg-red-500/10 transition shrink-0">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-theme-secondary">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary transition text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#FFD700] text-[#0A0A0A] font-bold hover:bg-[#E6C200] transition text-sm disabled:opacity-70">
                  {saving ? 'Saving...' : modal.partner ? 'Update' : 'Add State Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}