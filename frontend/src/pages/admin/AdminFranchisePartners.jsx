import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, X, MapPin, User, Phone, ChevronDown, ChevronUp, Store, Hash } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'
import { normalizeCards } from '../../utils/franchise'

const inputClass = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#FFD700]/60"
const smallInputClass = "w-full input-bg border border-theme rounded-lg px-3 py-2 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#FFD700]/60"
const labelClass = "text-theme-muted text-xs font-semibold uppercase tracking-wide"
const addBtnClass = "flex items-center gap-1 text-xs font-semibold text-[#FFD700] hover:text-[#E6C200] transition"
const removeBtnClass = "p-2 rounded-lg text-theme-muted hover:text-red-400 hover:bg-red-500/10 transition shrink-0"

const emptyArea   = () => ({ area: '', pincode: '' })
const emptyPerson = () => ({ name: '', phones: [''], areas: [emptyArea()] })
const emptyForm   = () => ({ state: '', order: 0, persons: [emptyPerson()] })

export default function AdminFranchisePartners() {
  const [states, setStates]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState({ open: false, card: null })
  const [form, setForm]         = useState(emptyForm())
  const [saving, setSaving]     = useState(false)
  const [expanded, setExpanded] = useState({})

  const load = () => {
    setLoading(true)
    api.get('/franchise-partners').then(r => setStates(normalizeCards(r.data))).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => { setForm(emptyForm()); setModal({ open: true, card: null }) }
  const openEdit = (c) => {
    setForm({
      state: c.state,
      order: c.order || 0,
      persons: c.persons.length
        ? c.persons.map(p => ({
            name: p.name || '',
            phones: p.phones?.length ? [...p.phones] : [''],
            areas: p.areas?.length ? p.areas.map(a => ({ area: a.area || '', pincode: a.pincode || '' })) : [emptyArea()],
          }))
        : [emptyPerson()],
    })
    setModal({ open: true, card: c })
  }
  const closeModal = () => setModal({ open: false, card: null })
  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  // ── form helpers: every change touches ONE person only ──
  const patchPerson = (pi, fn) => setForm(f => ({
    ...f, persons: f.persons.map((p, i) => (i === pi ? fn(p) : p)),
  }))

  // New person goes to the TOP of the state card.
  const addPerson = () => setForm(f => ({ ...f, persons: [emptyPerson(), ...f.persons] }))
  const removePerson = (pi) => setForm(f => ({ ...f, persons: f.persons.filter((_, i) => i !== pi) }))

  const setName = (pi, v) => patchPerson(pi, p => ({ ...p, name: v }))

  const addPhone = (pi) => patchPerson(pi, p => ({ ...p, phones: [...p.phones, ''] }))
  const setPhone = (pi, xi, v) => patchPerson(pi, p => ({ ...p, phones: p.phones.map((x, i) => (i === xi ? v : x)) }))
  const removePhone = (pi, xi) => patchPerson(pi, p => ({ ...p, phones: p.phones.filter((_, i) => i !== xi) }))

  const addArea = (pi) => patchPerson(pi, p => ({ ...p, areas: [...p.areas, emptyArea()] }))
  const setArea = (pi, ai, field, v) => patchPerson(pi, p => ({
    ...p, areas: p.areas.map((a, i) => (i === ai ? { ...a, [field]: v } : a)),
  }))
  const removeArea = (pi, ai) => patchPerson(pi, p => ({ ...p, areas: p.areas.filter((_, i) => i !== ai) }))

  const validate = () => {
    if (!form.state.trim()) { toast.error('State name is required'); return false }
    if (!form.persons.length) { toast.error('Add at least one person'); return false }
    for (const [i, p] of form.persons.entries()) {
      const who = p.name.trim() || `Person ${i + 1}`
      if (!p.name.trim()) { toast.error(`Enter a name for person ${i + 1}`); return false }
      if (!p.phones.some(x => x.trim())) { toast.error(`Add at least one mobile number for ${who}`); return false }
      for (const a of p.areas) {
        if (a.pincode.trim() && !/^\d{6}$/.test(a.pincode.trim())) {
          toast.error(`PIN code "${a.pincode}" (${who}) must be 6 digits`); return false
        }
      }
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
      persons: form.persons.map(p => ({
        name: p.name.trim(),
        phones: p.phones.map(x => x.trim()).filter(Boolean),
        areas: p.areas
          .map(a => ({ area: a.area.trim(), pincode: a.pincode.trim() }))
          .filter(a => a.area || a.pincode),
      })),
    }
    try {
      if (modal.card) await api.put(`/franchise-partners/${modal.card._id}`, payload)
      else await api.post('/franchise-partners', payload)
      toast.success(modal.card ? 'Franchise partner card updated' : 'Franchise partner card added')
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
          <p className="text-theme-secondary text-sm">{states.length} state{states.length === 1 ? '' : 's'}</p>
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
      ) : !states.length ? (
        <div className="bg-theme-card border border-theme rounded-2xl p-10 text-center text-theme-muted">
          No franchise partner cards yet. Click "Add State" to start.
        </div>
      ) : (
        <div className="space-y-4">
          {states.map((c) => {
            const isOpen = !!expanded[c._id]
            const areaCount = c.persons.reduce((n, p) => n + p.areas.length, 0)
            return (
              <div key={c._id} className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => toggleExpand(c._id)}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#FFD700]/10 shrink-0">
                    <Store size={16} className="text-[#FFD700]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-theme-primary font-bold">{c.state}</p>
                    <p className="text-theme-muted text-xs">
                      {c.persons.length} person{c.persons.length === 1 ? '' : 's'} · {areaCount} area{areaCount === 1 ? '' : 's'} · order {c.order}
                    </p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(c) }}
                    className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-[#FFD700]/10 hover:text-[#FFD700] text-theme-muted transition">
                    <Edit size={13} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(c._id) }}
                    className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-red-500/10 hover:text-red-400 text-theme-muted transition">
                    <Trash2 size={13} />
                  </button>
                  {isOpen ? <ChevronUp size={16} className="text-theme-muted" /> : <ChevronDown size={16} className="text-theme-muted" />}
                </div>

                {isOpen && (
                  <div className="border-t border-theme px-5 py-4 grid gap-3 md:grid-cols-2 items-start">
                    {c.persons.map((p, pi) => (
                      <div key={pi} className="bg-theme-tertiary rounded-xl p-4 space-y-3">
                        <p className="text-theme-primary font-semibold text-sm flex items-center gap-1.5">
                          <User size={13} className="text-theme-muted" />{p.name}
                        </p>
                        <div className="space-y-1">
                          {p.phones.map((ph, xi) => (
                            <p key={xi} className="text-theme-secondary font-mono text-xs flex items-center gap-1.5">
                              <Phone size={11} />{ph}
                            </p>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {p.areas.length === 0 && <span className="text-theme-muted text-xs">No areas</span>}
                          {p.areas.map((a, ai) => (
                            <span key={ai} className="text-xs px-2 py-1 rounded-md bg-theme-card text-theme-secondary flex items-center gap-1">
                              <MapPin size={10} className="text-theme-muted" />
                              {a.area}{a.area && a.pincode ? ' · ' : ''}{a.pincode}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
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
              <h3 className="text-theme-primary font-bold">{modal.card ? 'Edit Franchise Partner Card' : 'Add Franchise Partner Card'}</h3>
              <button onClick={closeModal} className="text-theme-muted hover:text-theme-primary p-1"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className={`${labelClass} mb-1.5 block`}>State Name</label>
                  <input type="text" placeholder="e.g. Telangana" value={form.state}
                    onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className={inputClass} required />
                </div>
                <div>
                  <label className={`${labelClass} mb-1.5 block`}>Order</label>
                  <input type="number" value={form.order}
                    onChange={e => setForm(f => ({ ...f, order: e.target.value }))} className={inputClass} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Person(s) — newest on top</label>
                  <button type="button" onClick={addPerson} className={addBtnClass}>
                    <Plus size={13} /> Add Person
                  </button>
                </div>

                {form.persons.map((p, pi) => (
                  <div key={pi} className="border border-theme rounded-xl p-4 space-y-4 bg-theme-tertiary/40">
                    {/* areas + pin codes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Pincode &amp; Area</label>
                        <button type="button" onClick={() => addArea(pi)} className={addBtnClass}>
                          <Plus size={13} /> Add Area
                        </button>
                      </div>
                      {p.areas.map((a, ai) => (
                        <div key={ai} className="flex items-center gap-2">
                          <div className="relative max-w-[110px] sm:max-w-[130px] w-full shrink-0">
                            <Hash size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-theme-muted pointer-events-none" />
                            <input type="text" inputMode="numeric" maxLength={6} placeholder="PIN" value={a.pincode}
                              onChange={e => setArea(pi, ai, 'pincode', e.target.value.replace(/\D/g, ''))}
                              className={`${smallInputClass} pl-7`} />
                          </div>
                          <input type="text" placeholder="Area (e.g. Nalgonda)" value={a.area}
                            onChange={e => setArea(pi, ai, 'area', e.target.value)} className={smallInputClass} />
                          {p.areas.length > 1 && (
                            <button type="button" onClick={() => removeArea(pi, ai)} className={removeBtnClass}><X size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* name */}
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Person name (shown below the areas)" value={p.name}
                        onChange={e => setName(pi, e.target.value)} className={smallInputClass} required />
                      {form.persons.length > 1 && (
                        <button type="button" onClick={() => removePerson(pi)} title="Remove this person" className={removeBtnClass}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* mobile numbers */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className={labelClass}>Mobile Number(s)</label>
                        <button type="button" onClick={() => addPhone(pi)} className={addBtnClass}>
                          <Plus size={13} /> Add Mobile
                        </button>
                      </div>
                      {p.phones.map((ph, xi) => (
                        <div key={xi} className="flex items-center gap-2">
                          <input type="tel" placeholder="Mobile number" value={ph}
                            onChange={e => setPhone(pi, xi, e.target.value)} className={smallInputClass} />
                          {p.phones.length > 1 && (
                            <button type="button" onClick={() => removePhone(pi, xi)} className={removeBtnClass}><X size={14} /></button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-theme-secondary">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary transition text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#FFD700] text-[#0A0A0A] font-bold hover:bg-[#E6C200] transition text-sm disabled:opacity-70">
                  {saving ? 'Saving...' : modal.card ? 'Update' : 'Add State Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}