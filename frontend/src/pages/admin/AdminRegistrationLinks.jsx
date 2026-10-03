import React, { useState, useEffect } from 'react'
import { Link2, Copy, Plus, Ban } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const STATUS_STYLE = {
  active:  'bg-[#44DD88]/10 text-[#44DD88]',
  used:    'bg-[#4488FF]/10 text-[#4488FF]',
  expired: 'bg-[#FF8800]/10 text-[#FF8800]',
  revoked: 'bg-red-500/10 text-red-400',
}

const linkFor = (token) => `${window.location.origin}/associate/register/${token}`

export default function AdminRegistrationLinks() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState('')
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    api.get('/admin/registration-links')
      .then(r => setLinks(r.data))
      .catch(() => toast.error('Failed to load links'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const copy = async (token) => {
    try { await navigator.clipboard.writeText(linkFor(token)); toast.success('Link copied') }
    catch { toast.error('Could not copy — select the link and copy it manually') }
  }

  const create = async () => {
    setCreating(true)
    try {
      const res = await api.post('/admin/registration-links', { label })
      setLabel('')
      setLinks(prev => [res.data, ...prev])
      await copy(res.data.token)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create link')
    } finally { setCreating(false) }
  }

  const revoke = async (id) => {
    if (!confirm('Revoke this link? It will stop working immediately.')) return
    try {
      const res = await api.delete(`/admin/registration-links/${id}`)
      setLinks(prev => prev.map(l => l._id === id ? { ...l, ...res.data } : l))
      toast.success('Link revoked')
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to revoke') }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-theme-primary font-black text-2xl">Registration Links</h1>
        <p className="text-theme-secondary text-sm">
          Each link lets one person register as an associate. It works once and expires after 7 days.
        </p>
      </div>

      <div className="bg-theme-card border border-theme rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="Note (optional) — e.g. who this link is for" value={label} maxLength={80}
          onChange={e => setLabel(e.target.value)}
          className="flex-1 min-w-[220px] input-bg border border-theme rounded-xl px-4 py-2.5 text-theme-primary text-sm placeholder-theme-muted focus:border-[#FFD700]/60" />
        <button onClick={create} disabled={creating}
          className="flex items-center gap-2 bg-[#2563EB] text-[#fefafa] font-bold px-4 py-2.5 rounded-xl hover:bg-[#1357eb] transition text-sm disabled:opacity-70">
          <Plus size={16} /> {creating ? 'Generating…' : 'Generate Link'}
        </button>
      </div>

      <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-theme">
                {['Note', 'Link', 'Status', 'Created', 'Expires / Used by', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-theme-muted font-medium text-xs whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b border-theme">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-3 bg-theme-tertiary rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : links.map(l => (
                <tr key={l._id} className="border-b border-theme hover:bg-theme-tertiary transition">
                  <td className="px-5 py-3 text-theme-primary whitespace-nowrap">{l.label || '—'}</td>
                  <td className="px-5 py-3 text-theme-secondary max-w-[260px] truncate font-mono text-xs">
                    <Link2 size={12} className="inline mr-1.5 -mt-0.5" />{linkFor(l.token)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLE[l.status]}`}>{l.status}</span>
                  </td>
                  <td className="px-5 py-3 text-theme-muted text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-theme-muted text-xs whitespace-nowrap">
                    {l.status === 'used' && l.usedBy ? `${l.usedBy.name} (${l.usedBy.associateId})` : new Date(l.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      {l.status === 'active' && (
                        <>
                          <button onClick={() => copy(l.token)} title="Copy link"
                            className="p-1.5 rounded-lg bg-theme-tertiary text-theme-muted hover:text-theme-primary transition"><Copy size={13} /></button>
                          <button onClick={() => revoke(l._id)} title="Revoke link"
                            className="p-1.5 rounded-lg bg-theme-tertiary text-theme-muted hover:bg-red-500/10 hover:text-red-400 transition"><Ban size={13} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !links.length && <div className="p-10 text-center text-theme-muted">No links yet. Generate one above.</div>}
        </div>
      </div>
    </div>
  )
}