import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, GraduationCap, Phone, Mail, X, MessageCircle, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api'

/* -------------------------------- PALETTE --------------------------------
   Matches the vivid blue poster theme used on the other static service
   pages (Ice Cream Parlour, Imports & Exports, Bio-CNG, Agri Investments).
   PAGE_BG is a gradient (not a flat near-black navy) so the page reads as
   clearly blue rather than blending into the site's black header/nav. */
const PAGE_BG = '#FFFFFF'
const NAVY = '#0a1e3f'
const CARD = '#173a72'
const BLUE = '#2563EB'
const YELLOW = '#f4c542'

// Number of tutor cards shown per page (applies to search results too)
const PAGE_SIZE = 3

// Public "Find your Online Tutor / Trainer / Teacher / Coach / Mentor /
// Advisor / Counsellor" directory. Unlike the static poster galleries, this
// section is fully dynamic: listings, and the filter dropdown options
// themselves, come from whatever the admin has published.
export default function TutorDirectory() {
  const [tutors, setTutors] = useState([])
  const [filterOptions, setFilterOptions] = useState({ subjects: [], levels: [], languages: [] })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  // Draft values bound to the dropdowns — changing these does NOT trigger a
  // search. They only take effect once the visitor clicks "Search".
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [language, setLanguage] = useState('')
  // The filters actually applied to the last fetch. Starts empty so the
  // page loads showing every published listing by default.
  const [appliedFilters, setAppliedFilters] = useState({ subject: '', level: '', language: '' })
  const [contactTutor, setContactTutor] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    api.get('/tutors/filters').then(r => setFilterOptions(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    const params = {}
    if (appliedFilters.subject) params.subject = appliedFilters.subject
    if (appliedFilters.level) params.level = appliedFilters.level
    if (appliedFilters.language) params.language = appliedFilters.language

    // Ignore responses from superseded requests (e.g. rapid Search clicks)
    // so an older, slower response can never overwrite a newer result.
    let cancelled = false
    setLoadError(false)
    api.get('/tutors', { params })
      .then(r => { if (!cancelled) setTutors(Array.isArray(r.data) ? r.data : []) })
      .catch(() => { if (!cancelled) { setTutors([]); setLoadError(true) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [appliedFilters])

  const handleSearch = () => {
    setAppliedFilters({ subject, level, language })
    setPage(1)
  }

  const handleClearFilters = () => {
    setSubject(''); setLevel(''); setLanguage('')
    setAppliedFilters({ subject: '', level: '', language: '' })
    setPage(1)
  }

  useEffect(() => {
    if (!contactTutor) return
    const onKey = (e) => { if (e.key === 'Escape') setContactTutor(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [contactTutor])

  const totalPages = Math.max(1, Math.ceil(tutors.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedTutors = tutors.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const goToPage = (n) => {
    setPage(Math.min(Math.max(n, 1), totalPages))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasActiveFilters = appliedFilters.subject || appliedFilters.level || appliedFilters.language
  const hasDraftFilters = subject || level || language
 const selectClass =
  "w-full px-3 py-2.5 rounded-lg bg-white text-sm focus:outline-none transition-colors"

const selectStyle = {
  color: '#000000',
  backgroundColor: '#FFFFFF',
  border: '1px solid rgba(244,197,66,0.35)'
}

const optionStyle = {
  color: '#000000',
  backgroundColor: '#FFFFFF'
}

  const waLink = useMemo(() => {
    if (!contactTutor?.contactPhone) return null
    const digits = contactTutor.contactPhone.replace(/[^\d+]/g, '')
    return `https://wa.me/${digits.replace(/^\+/, '')}`
  }, [contactTutor])

  return (
    <div className="min-h-screen" style={{ background: PAGE_BG }}>
      <div className="page-enter">
      {/* Header hero — full-bleed edge-to-edge photo, matching the other
          static service pages, instead of a rounded card inset in the
          padded container. */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80"
          alt="Online tutoring"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Navy overlay so text stays readable over the photo, matching
            the other poster pages' hero treatment */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(180deg, ${NAVY}99 0%, ${NAVY}cc 55%, ${NAVY} 100%)` }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:py-14">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4"
            style={{ backgroundColor: 'rgba(244,197,66,0.12)', border: `1px solid ${YELLOW}55` }}
          >
            <GraduationCap size={14} style={{ color: YELLOW }} />
            <span className="text-[11px] font-bold tracking-wide" style={{ color: YELLOW }}>
              FIND YOUR EXPERT
            </span>
          </div>
          <p className="text-white/80 text-[14px] uppercase">
            Online Tutor / Trainer / Teacher / Coach / Mentor / Advisor / Counsellor
          </p>
        </div>

        {/* Register-as-tutor callout — bottom-right corner of the banner */}
        <Link
          to="/contact"
          className="absolute z-20 bottom-3 right-3 sm:bottom-5 sm:right-5 flex items-center gap-1.5 bg-red-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow-lg hover:bg-red-700 transition"
        >
          <UserPlus size={14} />
          Register as Online Tutor
        </Link>
      </div>
          
      <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-red-600/10 border border-red-600/30 rounded-xl px-4 py-3 mb-6">
        <p className="text-red-500 text-xs font-bold uppercase tracking-wide mb-1.5">Note</p>
        <ul className="text-black text-xs sm:text-sm font-semibold leading-snug list-disc pl-4 space-y-1">
          <li>Ask for a free demo</li>
          <li>Pay after classes</li>
          <li>Only classes — no other things</li>
        </ul>
      </div>
        {/* Search + filters */}
        <div
          className="rounded-2xl p-4 mb-6 space-y-3 text-black"
          
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={subject} onChange={e => setSubject(e.target.value)} className={selectClass} style={selectStyle}>
              <option value="" style={optionStyle}>Subject/s</option>
              {filterOptions.subjects.map(s => <option key={s} value={s} style={optionStyle}>{s}</option>)}
            </select>
            <select value={level} onChange={e => setLevel(e.target.value)} className={selectClass} style={selectStyle}>
              <option value="" style={optionStyle}>Level/s</option>
              {filterOptions.levels.map(l => <option key={l} value={l} style={optionStyle}>{l}</option>)}
            </select>
            <select value={language} onChange={e => setLanguage(e.target.value)} className={selectClass} style={selectStyle}>
              <option value="" style={optionStyle}>Language/s</option>
              {filterOptions.languages.map(l => <option key={l} value={l} style={optionStyle}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSearch}
              className="px-5 py-2.5 rounded-lg text-sm font-bold transition hover:opacity-90"
              style={{ backgroundColor: BLUE, color: PAGE_BG }}
            >
              Search
            </button>
            {(hasActiveFilters || hasDraftFilters) && (
              <button
                onClick={handleClearFilters}
                className="text-xs hover:underline"
                style={{ color: BLUE }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(PAGE_SIZE)].map((_, i) => (
              <div key={i} className="rounded-2xl h-64 animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap size={40} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p className="text-white/70">
              {loadError
                ? 'Could not load listings. Please try again.'
                : hasActiveFilters ? 'No listings match your search.' : 'No listings available yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedTutors.map(t => (
              <div
                key={t._id}
                className="rounded-2xl overflow-hidden flex flex-col card-hover bg-[#2564eb42]"
                style={{ border: '1.5px solid rgba(255,255,255,0.12)' }}
              >
                <div className="flex gap-3 p-3">
                  <div className="min-w-0">
                    <p className="text-black font-bold text-sm truncate">{t.name}</p>
                    {t.subjects?.length > 0 && (
                      <p className="text-blacktext-xs mt-1 line-clamp-2">
                        <span className="font-semibold" style={{ color: BLUE }}>Subject/s:</span> {t.subjects.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="px-3 pb-3 flex-1 flex flex-col gap-1.5">
                  {t.levels?.length > 0 && (
                    <p className="text-black text-xs">
                      <span className="font-semibold" style={{ color: BLUE }}>Level/s:</span> {t.levels.join(', ')}
                    </p>
                  )}
                  {t.languages?.length > 0 && (
                    <p className="text-black text-xs">
                      <span className="font-semibold" style={{ color: BLUE }}>Language/s:</span> {t.languages.join(', ')}
                    </p>
                  )}
                  {t.profileInfo && (
                    <p className="text-black text-xs line-clamp-3">
                      <span className="font-semibold" style={{ color: BLUE }}>Profile/More Info:</span> {t.profileInfo}
                    </p>
                  )}
                  <button
                    onClick={() => setContactTutor(t)}
                    className="mt-auto pt-2 w-full py-2 rounded-lg text-xs font-bold transition hover:opacity-90"
                    style={{ backgroundColor: BLUE, color: PAGE_BG }}
                  >
                    CONTACT
                  </button>
                </div>
              </div>
            ))}
          </div>

          {tutors.length > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: BLUE, color: PAGE_BG }}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span className="text-black text-sm font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: BLUE, color: PAGE_BG }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
          </>
        )}
      </div>
      </div>

      {/* Contact popup — rendered as a sibling of the page-enter wrapper
          above (not nested inside it). page-enter's transform animation
          creates a containing block for position:fixed descendants, so
          nesting the modal inside it made "fixed inset-0" center against
          that scrollable transformed div instead of the real viewport. */}
      {contactTutor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setContactTutor(null)}
        >
          <div
            className="rounded-2xl w-full max-w-sm"
            style={{ backgroundColor: BLUE, border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="text-white font-bold">Contact {contactTutor.name}</h3>
              <button
                onClick={() => setContactTutor(null)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-2.5">
              {contactTutor.contactPhone && (
                <a
                  href={`tel:${contactTutor.contactPhone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-3 p-3 rounded-xl text-white text-sm transition"
                  style={{ border: '1px solid rgba(244,197,66,0.35)' }}
                >
                  <Phone size={16} style={{ color: YELLOW }} /> {contactTutor.contactPhone}
                </a>
              )}
              {contactTutor.contactPhone && waLink && (
                <a
                  href={waLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl text-white text-sm transition"
                  style={{ border: '1px solid rgba(244,197,66,0.35)' }}
                >
                  <MessageCircle size={16} style={{ color: YELLOW }} /> Message on WhatsApp
                </a>
              )}
              {contactTutor.contactEmail && (
                <a
                  href={`mailto:${contactTutor.contactEmail}`}
                  className="flex items-center gap-3 p-3 rounded-xl text-white text-sm transition"
                  style={{ border: '1px solid rgba(244,197,66,0.35)' }}
                >
                  <Mail size={16} style={{ color: YELLOW }} /> {contactTutor.contactEmail}
                </a>
              )}
              {!contactTutor.contactPhone && !contactTutor.contactEmail && (
                <p className="text-white/60 text-sm">No contact details available for this listing.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}