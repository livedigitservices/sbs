import React, { useState, useEffect, useCallback } from 'react'
import { Users2, GraduationCap, Search, ChevronLeft, ChevronRight, Ban, CheckCircle2, ArrowLeft } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUS_LABEL = { new: 'New', in_progress: 'In Progress', converted: 'Converted', rejected: 'Rejected' }
const STATUS_COLORS = { new: '#4488FF', in_progress: '#FF8800', converted: '#44DD88', rejected: '#FF4444' }

export default function AdminAssociates() {
  const [associates, setAssociates] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null) // associate whose leads we're viewing
  const [selectedTutors, setSelectedTutors] = useState(null) // associate whose tutors we're viewing

  const load = () => {
    setLoading(true)
    api.get('/admin/associates').then(r => setAssociates(r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const toggleActive = async (id) => {
    try {
      const res = await api.put(`/admin/associates/${id}/toggle-active`)
      setAssociates(prev => prev.map(a => a._id === id ? { ...a, isActive: res.data.isActive } : a))
      toast.success(res.data.isActive ? 'Associate enabled' : 'Associate disabled')
    } catch { toast.error('Failed to update associate') }
  }

  const filtered = associates.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.mobile.includes(search)
  )

  if (selected) return <AssociateLeadsAdminView associate={selected} onBack={() => setSelected(null)} />
  if (selectedTutors) return <AssociateTutorsAdminView associate={selectedTutors} onBack={() => { setSelectedTutors(null); load() }} />

  return (
    <div>
      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
        <input type="text" placeholder="Search by name or mobile..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full input-bg border border-theme rounded-xl pl-10 pr-4 py-2.5 text-theme-primary text-sm placeholder-theme-muted focus:border-[#FFD700]/60" />
      </div>

      <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme">
                {['Name', 'Client ID', 'Leads', 'Tutors', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-theme-muted font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-theme">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-3 bg-theme-tertiary rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : filtered.map(a => (
                <tr key={a._id} className="border-b border-theme hover:bg-theme-tertiary transition">
                  <td className="px-5 py-3 text-theme-primary font-medium whitespace-nowrap">{a.name}</td>
                  <td className="px-5 py-3 text-theme-secondary whitespace-nowrap">{a.associateId}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => setSelected(a)} className="flex items-center gap-1.5 text-[#FFD700] hover:underline">
                      <Users2 size={13} /> {a.leadCount}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => setSelectedTutors(a)} className="flex items-center gap-1.5 text-[#FFD700] hover:underline">
                      <GraduationCap size={13} /> {a.tutorCount ?? 0}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${a.isActive ? 'bg-[#44DD88]/10 text-[#44DD88]' : 'bg-red-500/10 text-red-400'}`}>
                      {a.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-theme-muted text-xs whitespace-nowrap">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(a._id)}
                      className={`p-1.5 rounded-lg bg-theme-tertiary text-theme-muted transition ${a.isActive ? 'hover:bg-red-500/10 hover:text-red-400' : 'hover:bg-[#44DD88]/10 hover:text-[#44DD88]'}`}
                      title={a.isActive ? 'Disable associate' : 'Enable associate'}>
                      {a.isActive ? <Ban size={13} /> : <CheckCircle2 size={13} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !filtered.length && <div className="p-10 text-center text-theme-muted">No associates found.</div>}
        </div>
      </div>
    </div>
  )
}

function AssociateLeadsAdminView({ associate, onBack }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/leads', { params: { associate: associate._id, page, limit: 10 } })
      .then(r => { setLeads(r.data.leads); setTotalPages(r.data.totalPages); setTotalCount(r.data.totalCount) })
      .finally(() => setLoading(false))
  }, [associate._id, page])
  useEffect(load, [load])

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-theme-secondary hover:text-theme-primary text-sm mb-4 transition">
        <ArrowLeft size={15} /> Back to Associates
      </button>
      <div className="mb-6">
        <h1 className="text-theme-primary font-black text-2xl">{associate.name}'s Leads</h1>
        <p className="text-theme-secondary text-sm">{totalCount} total leads · ID {associate.associateId}</p>
      </div>

      <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme">
                {['Client', 'Business', 'Mobile', 'City', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-theme-muted font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-theme">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-3 bg-theme-tertiary rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : leads.map(lead => (
                <tr key={lead._id} className="border-b border-theme hover:bg-theme-tertiary transition">
                  <td className="px-5 py-3 text-theme-primary font-medium whitespace-nowrap">{lead.clientName}</td>
                  <td className="px-5 py-3 text-theme-secondary max-w-[160px] truncate">{lead.businessName || '—'}</td>
                  <td className="px-5 py-3 text-theme-secondary whitespace-nowrap">{lead.mobile}</td>
                  <td className="px-5 py-3 text-theme-secondary whitespace-nowrap">{lead.city || '—'}</td>
                  <td className="px-5 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: `${STATUS_COLORS[lead.status]}15`, color: STATUS_COLORS[lead.status] }}>
                      {STATUS_LABEL[lead.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-theme-muted text-xs whitespace-nowrap">{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !leads.length && <div className="p-10 text-center text-theme-muted">No leads for this associate yet.</div>}
        </div>

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
    </div>
  )
}

function AssociateTutorsAdminView({ associate, onBack }) {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tutors/all', { params: { associate: associate._id } })
      .then(r => setTutors(r.data))
      .finally(() => setLoading(false))
  }, [associate._id])

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-theme-secondary hover:text-theme-primary text-sm mb-4 transition">
        <ArrowLeft size={15} /> Back to Associates
      </button>
      <div className="mb-6">
        <h1 className="text-theme-primary font-black text-2xl">{associate.name}'s Tutors</h1>
        <p className="text-theme-secondary text-sm">{loading ? '…' : tutors.length} tutors added · Client ID {associate.associateId}</p>
      </div>

      <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme">
                {['Name', 'Subjects', 'Phone', 'Status', 'Added'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-theme-muted font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-theme">
                    {[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-3 bg-theme-tertiary rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : tutors.map(t => (
                <tr key={t._id} className="border-b border-theme hover:bg-theme-tertiary transition">
                  <td className="px-5 py-3 text-theme-primary font-medium whitespace-nowrap">{t.name}</td>
                  <td className="px-5 py-3 text-theme-secondary max-w-[220px] truncate">{(t.subjects || []).join(', ') || '—'}</td>
                  <td className="px-5 py-3 text-theme-secondary whitespace-nowrap">{t.contactPhone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.isActive ? 'bg-[#44DD88]/10 text-[#44DD88]' : 'bg-red-500/10 text-red-400'}`}>
                      {t.isActive ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-theme-muted text-xs whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !tutors.length && <div className="p-10 text-center text-theme-muted">This associate hasn't added any tutors yet.</div>}
        </div>
      </div>
    </div>
  )
}