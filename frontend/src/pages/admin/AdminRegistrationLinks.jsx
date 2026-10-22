import React, { useState, useEffect } from 'react'
import { Link2, Copy, RefreshCw, Power } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const linkFor = (token) => `${window.location.origin}/associate/register/${token}`

export default function AdminRegistrationLinks() {
  const [link, setLink] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get('/admin/registration-link')
      .then(r => setLink(r.data))
      .catch(() => toast.error('Failed to load registration link'))
      .finally(() => setLoading(false))
  }, [])

  const url = link ? linkFor(link.token) : ''

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast.success('Link copied') }
    catch { toast.error('Could not copy — select the link and copy it manually') }
  }

  const toggle = async () => {
    setBusy(true)
    try {
      const res = await api.put('/admin/registration-link/status', { isActive: !link.isActive })
      setLink(res.data)
      toast.success(res.data.isActive ? 'Registration enabled' : 'Registration disabled')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update')
    } finally { setBusy(false) }
  }

  const regenerate = async () => {
    if (!confirm('Generate a new link? The current link will stop working immediately and you will need to share the new one.')) return
    setBusy(true)
    try {
      const res = await api.post('/admin/registration-link/regenerate')
      setLink(res.data)
      toast.success('New link generated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to regenerate')
    } finally { setBusy(false) }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-theme-primary font-black text-2xl">Registration Link</h1>
        <p className="text-theme-secondary text-sm">
          One permanent link for everyone. Anyone who opens it can register as a new associate. It never expires.
        </p>
      </div>

      <div className="bg-theme-card border border-theme rounded-2xl p-5 max-w-3xl">
        {loading ? (
          <div className="h-10 bg-theme-tertiary rounded animate-pulse" />
        ) : !link ? (
          <p className="text-theme-muted text-sm">Could not load the link. Refresh the page.</p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-theme-muted text-xs font-semibold uppercase tracking-wide">Shareable link</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${link.isActive ? 'bg-[#44DD88]/10 text-[#44DD88]' : 'bg-red-500/10 text-red-400'}`}>
                {link.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex-1 min-w-[240px] input-bg border border-theme rounded-xl px-4 py-2.5 text-theme-secondary font-mono text-xs break-all">
                <Link2 size={12} className="inline mr-1.5 -mt-0.5" />{url}
              </div>
              <button onClick={copy}
                className="flex items-center gap-2 bg-[#2563EB] text-[#fefafa] font-bold px-4 py-2.5 rounded-xl hover:bg-[#1357eb] transition text-sm">
                <Copy size={15} /> Copy Link
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-theme">
              <button onClick={toggle} disabled={busy}
                className="flex items-center gap-2 bg-theme-tertiary text-theme-primary font-semibold px-4 py-2 rounded-xl hover:opacity-80 transition text-sm disabled:opacity-60">
                <Power size={14} /> {link.isActive ? 'Disable registration' : 'Enable registration'}
              </button>
              <button onClick={regenerate} disabled={busy}
                className="flex items-center gap-2 bg-theme-tertiary text-red-400 font-semibold px-4 py-2 rounded-xl hover:bg-red-500/10 transition text-sm disabled:opacity-60">
                <RefreshCw size={14} /> Generate new link
              </button>
            </div>
            <p className="text-theme-muted text-xs mt-3">
              Registered associates appear under Associates. Generate a new link only if this one is misused — the old one stops working immediately.
            </p>
          </>
        )}
      </div>
    </div>
  )
}