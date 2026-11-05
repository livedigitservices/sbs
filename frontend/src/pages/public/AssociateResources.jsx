import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Download, Share2, Play, Image as ImageIcon, Link2, Youtube, Instagram, Facebook, MessageCircle, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'
import MediaPopup from '../../components/MediaPopup'

// How often (ms) the page quietly checks for newly added media while it is open.
const REFRESH_INTERVAL = 30000

// Number of resources shown on each page.
const PAGE_SIZE = 4

const platformIcon = (platform, size = 14) => {
  switch (platform) {
    case 'YouTube': return <Youtube size={size} />
    case 'Instagram': return <Instagram size={size} />
    case 'Facebook': return <Facebook size={size} />
    case 'WhatsApp': return <MessageCircle size={size} />
    default: return <Link2 size={size} />
  }
}

const hostOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

// Newest first by creation time (the API already sorts this way; sorting again
// here guarantees it even if the response is ever reordered).
const newestFirst = (a, b) => {
  const diff = new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  if (diff !== 0) return diff
  return String(b._id).localeCompare(String(a._id))
}

// Used only to detect whether anything changed between two background refreshes.
const signature = (list) => list.map(r => `${r._id}:${r.updatedAt || ''}`).join('|')

const fileNameFor = (resource) => {
  try {
    const last = decodeURIComponent(new URL(resource.url).pathname.split('/').pop() || '')
    if (last) return last
  } catch { /* fall through */ }
  return 'media'
}

export default function AssociateResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [preview, setPreview]     = useState(null)
  const [page, setPage]           = useState(1)
  const lastSignature = useRef('')

  // Initial load + silent refreshes (on an interval and whenever the tab becomes
  // visible again) so new uploads appear without a manual page reload.
  useEffect(() => {
    let cancelled = false

    const fetchResources = (isInitial) =>
      api.get('/resources')
        .then(r => {
          if (cancelled) return
          const list = [...r.data].sort(newestFirst)
          const sig = signature(list)
          if (sig !== lastSignature.current) {
            lastSignature.current = sig
            setResources(list)
          }
        })
        .catch(() => { if (isInitial && !cancelled) setResources([]) })
        .finally(() => { if (isInitial && !cancelled) setLoading(false) })

    fetchResources(true)

    const refreshIfVisible = () => { if (document.visibilityState === 'visible') fetchResources(false) }
    const timer = setInterval(refreshIfVisible, REFRESH_INTERVAL)
    document.addEventListener('visibilitychange', refreshIfVisible)
    window.addEventListener('focus', refreshIfVisible)

    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', refreshIfVisible)
      window.removeEventListener('focus', refreshIfVisible)
    }
  }, [])

  useEffect(() => {
    if (preview) {
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prevOverflow }
    }
  }, [preview])

  const handleDownload = async (resource) => {
    try {
      const res = await fetch(resource.url)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileNameFor(resource)
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleShare = async (resource) => {
    if (navigator.share) {
      try {
        await navigator.share({ url: resource.url })
      } catch {}
      return
    }
    try {
      await navigator.clipboard.writeText(resource.url)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Could not copy link')
    }
  }

  // One flat, newest-first list — no category / service / title headings.
  const items = useMemo(() => resources, [resources])

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedItems = useMemo(
    () => items.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [items, currentPage]
  )

  const goToPage = (n) => {
    setPage(Math.min(Math.max(n, 1), totalPages))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    // Exactly one screen tall: 100dvh minus navbar (4rem) and footer (3rem), so the page never scrolls.
    <div
      className="page-enter bg-theme-primary flex flex-col overflow-hidden"
      style={{ height: 'calc(100dvh - 7rem)', minHeight: 480 }}
    >
      <div className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-4 pt-4 pb-3">
        {loading ? (
          <div className="h-full grid grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 gap-3">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <div key={i} className="min-h-0 bg-theme-card border border-theme rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <ImageIcon size={40} className="text-gray-400 mx-auto mb-4" />
            <p className="text-theme-secondary">No resources available yet.</p>
          </div>
        ) : (
          <div className="h-full grid grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 gap-3">
            {pagedItems.map(r => (
              r.type === 'link'
                ? <LinkCard key={r._id} resource={r} />
                : <MediaCard key={r._id} resource={r} onPreview={setPreview} onDownload={handleDownload} onShare={handleShare} />
            ))}
          </div>
        )}
      </div>

      <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />

      {/* Lightbox preview */}
      <MediaPopup
        resource={preview}
        onClose={() => setPreview(null)}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </div>
  )
}

// Always returns the same number of slots (up to MAX_SLOTS) so the bar never changes width.
const MAX_SLOTS = 5
function getPageWindow(page, totalPages) {
  const count = Math.min(MAX_SLOTS, totalPages)
  const start = Math.min(Math.max(page - Math.floor(count / 2), 1), totalPages - count + 1)
  return Array.from({ length: count }, (_, i) => start + i)
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return <div className="shrink-0 h-16" aria-hidden="true" />

  const navBtn =
    'inline-flex items-center justify-center gap-1.5 h-10 w-[6.25rem] sm:w-28 rounded-xl border-2 text-sm font-bold transition select-none ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ' +
    'disabled:cursor-not-allowed disabled:bg-theme-tertiary disabled:border-transparent disabled:text-theme-muted disabled:opacity-70'
  const prevCls = `${navBtn} bg-theme-card border-accent text-accent hover:bg-accent/10`
  const nextCls = `${navBtn} bg-accent border-accent text-accent-contrast hover:bg-accent-hover hover:border-accent-hover`
  const pageBtn =
    'inline-flex items-center justify-center w-10 h-10 rounded-xl border text-sm font-semibold transition ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50'

  return (
    <nav
      aria-label="Pagination"
      className="shrink-0 border-t border-theme bg-theme-secondary"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-center gap-2 sm:gap-3">
        <button onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Previous page" className={prevCls}>
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Phones: compact indicator. Tablets and up: numbered buttons. */}
        <span className="sm:hidden min-w-[4.5rem] text-center text-sm font-semibold text-theme-secondary tabular-nums">
          {page} / {totalPages}
        </span>
        <div className="hidden sm:flex items-center gap-1.5">
          {getPageWindow(page, totalPages).map(n => (
            <button
              key={n}
              onClick={() => onChange(n)}
              aria-label={`Page ${n}`}
              aria-current={n === page ? 'page' : undefined}
              className={`${pageBtn} ${n === page
                ? 'bg-accent border-accent text-accent-contrast shadow-sm'
                : 'bg-theme-card border-theme text-theme-secondary hover:border-accent hover:text-accent'}`}
            >
              {n}
            </button>
          ))}
        </div>

        <button onClick={() => onChange(page + 1)} disabled={page === totalPages} aria-label="Next page" className={nextCls}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  )
}

function LinkCard({ resource: r }) {
  return (
    <a href={r.url} target="_blank" rel="noopener noreferrer"
      className="h-full min-h-0 bg-theme-card border border-theme rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center card-hover">
      <span className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
        {platformIcon(r.platform, 22)}
      </span>
      <span className="text-theme-primary font-semibold text-sm">{r.platform || 'Link'}</span>
      <span className="text-theme-muted text-[11px] max-w-full truncate">{hostOf(r.url)}</span>
      <span className="text-accent text-[11px] font-semibold flex items-center gap-1">Open <ExternalLink size={11} /></span>
    </a>
  )
}

function MediaCard({ resource: r, onPreview, onDownload, onShare }) {
  return (
    <div className="h-full min-h-0 bg-[#F3F8FF] border border-accent/15 rounded-2xl overflow-hidden flex flex-col card-hover">
      <button
        onClick={() => onPreview(r)}
        aria-label={r.type === 'video' ? 'Play video' : 'View image'}
        className="relative block w-full flex-1 min-h-0 bg-gradient-to-b from-[#EAF2FF] to-[#CFE1FD] overflow-hidden"
      >
        {r.type === 'video' ? (
          // The frame fills the card; `contain` shows any clip without cropping.
          <div className="absolute inset-0 ">
            <video src={r.url} className="w-full h-full object-contain" muted playsInline preload="metadata" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-black/60 border border-white/30 text-white flex items-center justify-center">
                <Play size={16} className="ml-0.5" />
              </span>
            </span>
          </div>
        ) : (
          // Images are fitted inside the card — never cropped or stretched.
          <img src={r.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-contain" />
        )}
      </button>
      <div className="p-2 flex gap-1.5 shrink-0">
        <button onClick={() => onDownload(r)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-accent text-accent-contrast font-bold hover:bg-accent-hover transition py-1.5 text-[11px]">
          <Download size={11} /> Download
        </button>
        <button onClick={() => onShare(r)}
          title="Share" aria-label="Share"
          className="flex items-center justify-center rounded-lg border border-theme text-theme-secondary font-semibold hover:text-theme-primary hover:border-theme-gold transition px-2 py-1.5">
          <Share2 size={11} />
        </button>
      </div>
    </div>
  )
}