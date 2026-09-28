import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Edit, Trash2, X, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { associateApi } from '../../api'
import toast from 'react-hot-toast'

const EMPTY = { clientName: '', mobile: '', leadFor: '', status: 'new' }
const STATUS_LABEL = { new: 'New', in_progress: 'In Progress', converted: 'Converted', rejected: 'Rejected' }
const STATUS_COLORS = { new: '#4488FF', in_progress: '#FF8800', converted: '#44DD88', rejected: '#FF4444' }
const EDITABLE_FIELDS = ['clientName', 'mobile', 'leadFor', 'status']

export default function AssociateLeads() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [modal, setModal] = useState({ open: searchParams.get('new') === '1', lead: null })
  const [viewLead, setViewLead] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params = { page, limit, sortBy, sortDir }
    if (search.trim()) params.search = search.trim()

    associateApi.get('/associate/leads', { params })
      .then(r => {
        setLeads(r.data.leads)
        setTotalCount(r.data.totalCount)
        setTotalPages(r.data.totalPages)
      })
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setLoading(false))
  }, [page, limit, sortBy, sortDir, search])

  useEffect(load, [load])

  // Reset to page 1 whenever the search changes
  useEffect(() => { setPage(1) }, [search])

  const openAdd = () => { setForm(EMPTY); setModal({ open: true, lead: null }) }
  const openEdit = (lead) => { setForm({ ...lead }); setModal({ open: true, lead }) }
  const closeModal = () => { setModal({ open: false, lead: null }); if (searchParams.get('new')) setSearchParams({}) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {}
      EDITABLE_FIELDS.forEach(k => { payload[k] = form[k] ?? '' })
      if (modal.lead) await associateApi.put(`/associate/leads/${modal.lead._id}`, payload)
      else await associateApi.post('/associate/leads', payload)
      toast.success(modal.lead ? 'Lead updated' : 'Lead added')
      closeModal()
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save lead')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead? This cannot be undone.')) return
    try {
      await associateApi.delete(`/associate/leads/${id}`)
      toast.success('Lead deleted')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete lead')
    }
  }

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('asc') }
  }

  const inputClass = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-theme-muted focus:border-[#FFD700]/60"

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-theme-primary font-black text-2xl">My Leads</h1>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#2563EB] text-[#f2f0f0] font-bold px-4 py-2.5 rounded-xl hover:bg-[#185bed] transition text-sm">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input type="text" placeholder="Search by name, mobile, or lead " value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full input-bg border border-theme rounded-xl pl-10 pr-4 py-2.5 text-theme-primary text-sm placeholder-theme-muted focus:border-[#FFD700]/60" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme">
                {[
                  { key: null, label: 'S.No' },
                  { key: 'clientName', label: 'Name' },
                  { key: null, label: 'Mobile Number' },
                  { key: null, label: 'Lead For' },
                  { key: null, label: 'Delete' },
                ].map(({ key, label }) => (
                  <th key={label} className="text-left px-5 py-3 text-theme-muted font-medium text-xs whitespace-nowrap">
                    {key ? (
                      <button onClick={() => toggleSort(key)} className="flex items-center gap-1 hover:text-theme-primary transition">
                        {label} {sortBy === key && (sortDir === 'asc' ? '↑' : '↓')}
                      </button>
                    ) : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-theme">
                    {[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-3 bg-theme-tertiary rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : leads.map((lead, idx) => (
                <tr key={lead._id} className="border-b border-theme hover:bg-theme-tertiary transition">
                  <td className="px-5 py-3 text-theme-muted whitespace-nowrap">{(page - 1) * limit + idx + 1}</td>
                  <td className="px-5 py-3 text-theme-primary font-medium whitespace-nowrap">{lead.clientName}</td>
                  <td className="px-5 py-3 text-theme-secondary whitespace-nowrap">{lead.mobile}</td>
                  <td className="px-5 py-3 text-theme-secondary max-w-[200px] truncate">{lead.leadFor}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(lead._id)} className="p-1.5 rounded-lg bg-theme-tertiary hover:bg-red-500/10 hover:text-red-400 text-theme-muted transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !leads.length && <div className="p-10 text-center text-theme-muted">No leads found. Click "Add Lead" to start.</div>}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-theme">
            <p className="text-theme-muted text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page <= 1}
                className="p-1.5 rounded-lg bg-theme-tertiary text-theme-secondary hover:text-theme-primary transition disabled:opacity-40">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-theme-tertiary text-theme-secondary hover:text-theme-primary transition disabled:opacity-40">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-theme">
              <h3 className="text-theme-primary font-bold">{modal.lead ? 'Edit Lead' : 'Add New Lead'}</h3>
              <button onClick={closeModal} className="text-theme-muted hover:text-theme-primary p-1"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {[
                { key: 'clientName', label: 'Name', placeholder: 'e.g. Ramesh Kumar', required: true },
                { key: 'mobile', label: 'Mobile Number', placeholder: 'e.g. 9876543210', required: true },
                { key: 'leadFor', label: 'Lead For', placeholder: 'e.g. Business Loan, Hotel Management', required: true },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="text-theme-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">{label}</label>
                  <input type="text" placeholder={placeholder} value={form[key] ?? ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={inputClass} required={required} />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-gold transition text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#2563EB] text-[#fdfdfd] font-bold hover:bg-[#1155e8] transition text-sm disabled:opacity-70">
                  {saving ? 'Saving...' : modal.lead ? 'Update Lead' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-theme-secondary border border-theme rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-theme">
              <h3 className="text-theme-primary font-bold">Lead Details</h3>
              <button onClick={() => setViewLead(null)} className="text-theme-muted hover:text-theme-primary p-1"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              {[
                ['Name', viewLead.clientName], ['Mobile Number', viewLead.mobile], ['Lead For', viewLead.leadFor],
                // ['Status', STATUS_LABEL[viewLead.status]],
                ['Created', new Date(viewLead.createdAt).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-theme pb-2">
                  <span className="text-theme-muted">{label}</span>
                  <span className="text-theme-primary text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}