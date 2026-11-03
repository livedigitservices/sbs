import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Share2 } from 'lucide-react'

export default function MediaPopup({ resource, onClose, onDownload, onShare }) {
  useEffect(() => {
    if (!resource) return
    const prevHtml = document.documentElement.style.overflow
    const prevBody = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)

    return () => {
      document.documentElement.style.overflow = prevHtml
      document.body.style.overflow = prevBody
      window.removeEventListener('keydown', onKey)
    }
  }, [resource, onClose])

  if (!resource) return null

  // Rendered through a portal straight to <body> so this overlay is always
  // positioned against the real viewport — never against an animated/
  // transformed ancestor (e.g. the page's .page-enter wrapper), which is
  // what was previously squeezing the modal into the content area instead
  // of covering the full screen.
  return createPortal(
    <div
      className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <button
        className="fixed top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:border-white/40 transition z-[1000]"
        onClick={onClose}
        aria-label="Close preview"
      >
        <X size={20} />
      </button>

      <div
        className="flex flex-col items-center w-full my-auto"
        style={{ maxWidth: 'min(92vw, 620px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {resource.type === 'video' ? (
          <video
            src={resource.url}
            controls
            autoPlay
            playsInline
            style={{ width: '100%', maxHeight: '70dvh', objectFit: 'contain' }}
            className="rounded-xl bg-black"
          />
        ) : (
          <img
            src={resource.url}
            alt="Media preview"
            style={{ width: '100%', maxHeight: '70dvh', objectFit: 'contain' }}
            className="rounded-xl"
          />
        )}

        <div className="flex justify-center gap-3 mt-3 pb-1">
          <button onClick={() => onDownload(resource)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FFD700] text-[#0A0A0A] text-xs font-bold hover:bg-[#FFE44D] transition">
            <Download size={13} /> Download
          </button>
          <button onClick={() => onShare(resource)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/30 text-white text-xs font-semibold hover:border-white/60 transition">
            <Share2 size={13} /> Share
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}