import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Download, Share2, Play, Image as ImageIcon, Link2, Youtube, Instagram, Facebook, MessageCircle, ExternalLink } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'
import MediaPopup from '../../components/MediaPopup'

// How often (ms) the page quietly checks for newly added media while it is open.
const REFRESH_INTERVAL = 30000

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

  return (
    <div className="page-enter bg-theme-primary min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-theme-card border border-theme rounded-2xl h-44 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon size={40} className="text-gray-400 mx-auto mb-4" />
            <p className="text-theme-secondary">No resources available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 items-start">
            {items.map(r => (
              r.type === 'link'
                ? <LinkCard key={r._id} resource={r} />
                : <MediaCard key={r._id} resource={r} onPreview={setPreview} onDownload={handleDownload} onShare={handleShare} />
            ))}
          </div>
        )}
      </div>

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

function LinkCard({ resource: r }) {
  return (
    <a href={r.url} target="_blank" rel="noopener noreferrer"
      className="bg-theme-card border border-theme rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center card-hover min-h-[10rem]">
      <span className="w-12 h-12 rounded-xl bg-[#FFD700]/10 text-[#FFD700] flex items-center justify-center shrink-0">
        {platformIcon(r.platform, 22)}
      </span>
      <span className="text-theme-primary font-semibold text-sm">{r.platform || 'Link'}</span>
      <span className="text-theme-muted text-[11px] max-w-full truncate">{hostOf(r.url)}</span>
      <span className="text-[#FFD700] text-[11px] font-semibold flex items-center gap-1">Open <ExternalLink size={11} /></span>
    </a>
  )
}

function MediaCard({ resource: r, onPreview, onDownload, onShare }) {
  return (
    <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden flex flex-col card-hover">
      <button
        onClick={() => onPreview(r)}
        aria-label={r.type === 'video' ? 'Play video' : 'View image'}
        className="relative block w-full bg-black/20 overflow-hidden"
      >
        {r.type === 'video' ? (
          // Videos keep a 16:9 frame; `contain` shows portrait clips without cropping.
          <div className="aspect-video bg-black">
            <video src={r.url} className="w-full h-full object-contain" muted playsInline preload="metadata" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-10 h-10 rounded-full bg-black/60 border border-white/30 text-white flex items-center justify-center">
                <Play size={16} className="ml-0.5" />
              </span>
            </span>
          </div>
        ) : (
          // Images render at their natural aspect ratio — never cropped or stretched.
          <img src={r.url} alt="" loading="lazy" className="block w-full h-auto min-h-[6rem]" />
        )}
      </button>
      <div className="p-2 flex gap-1.5">
        <button onClick={() => onDownload(r)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#FFD700] text-[#0A0A0A] font-bold hover:bg-[#FFE44D] transition py-1.5 text-[11px]">
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