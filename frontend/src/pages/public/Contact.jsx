import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Phone, MapPin, Store, Briefcase, SearchX, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../api'
import { normalizeCards } from '../../utils/franchise'
import SearchBar from '../../components/SearchBar'

const STATE_COLORS = ['#4488FF', '#FF4444', '#44DD88', '#FFD700', '#FF88AA', '#AA88FF']
const FRANCHISE_COLOR = '#2563EB'
const CARDS_PER_PAGE = 4

// Keeps only digits and a leading "+" so tel: links are always well-formed,
// even if a number was pasted into the Admin panel with spaces, dashes,
// or other stray characters.
const cleanPhone = (raw) => {
  const trimmed = (raw || '').trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  return hasPlus ? `+${digits}` : digits
}

const norm = (s) => (s || '').toString().toLowerCase().trim()
const onlyDigits = (s) => (s || '').toString().replace(/\D/g, '')

function PersonCard({ person }) {
  const phones = person.phones || []

  return (
    <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(37,99,235,0.10)]">
      <div className="px-4 sm:px-5 py-3.5 space-y-2.5">
        {/* Name on the left, mobile number(s) on the right */}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <span className="text-theme-primary font-semibold text-sm break-words min-w-0">{person.name}</span>
          <div className="flex flex-col items-end gap-1 ml-auto">
            {phones.map((ph, i) => (
              <a
                key={i}
                href={`tel:${cleanPhone(ph)}`}
                className="inline-flex items-center gap-1.5 text-sm font-mono transition-opacity hover:opacity-70"
                style={{ color: FRANCHISE_COLOR }}
              >
                <Phone size={12} strokeWidth={2} />
                {ph}
              </a>
            ))}
          </div>
        </div>

        {/* Location + Services / Business */}
        {(person.location || person.services) && (
          <div className="pt-2.5 border-t border-theme space-y-1.5">
            {person.location && (
              <p className="flex items-start gap-2 text-xs text-theme-secondary">
                <MapPin size={13} className="shrink-0 mt-0.5" style={{ color: FRANCHISE_COLOR }} />
                <span className="break-words min-w-0">{person.location}</span>
              </p>
            )}
            {person.services && (
              <p className="flex items-start gap-2 text-xs text-theme-secondary">
                <Briefcase size={13} className="shrink-0 mt-0.5" style={{ color: FRANCHISE_COLOR }} />
                <span className="break-words min-w-0">{person.services}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StateCard({ stateCard }) {
  const color = STATE_COLORS[stateCard._ci % STATE_COLORS.length]
  return (
    <div
      className="bg-theme-card border border-theme rounded-2xl overflow-hidden"
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ background: `${color}10` }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <MapPin size={16} style={{ color }} />
        </div>
        <h2 className="text-theme-primary font-bold text-lg tracking-wide">
          {stateCard.state}
        </h2>
      </div>

      <div className="divide-y divide-theme">
        {(stateCard.districts || []).map((d, di) => (
          <div key={di} className="px-5 py-4">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color }}
            >
              {d.district}
            </p>

            <div className="space-y-2">
              {(d.persons || []).map((p, pi) => (
                <div key={pi} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-theme-primary font-medium">
                    {p.name}
                  </span>
                  <a
                    href={`tel:${cleanPhone(p.phone)}`}
                    className="flex items-center gap-1.5 text-sm font-mono transition-opacity hover:opacity-70"
                    style={{ color }}
                  >
                    <Phone size={12} strokeWidth={2} />
                    {p.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Contact() {
  const [contacts, setContacts] = useState([])
  const [franchisePartners, setFranchisePartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const scrollRef = useRef(null)

  useEffect(() => {
    Promise.all([
      api.get('/contacts').then(r => setContacts(r.data)).catch(() => setContacts([])),
      api.get('/franchise-partners').then(r => setFranchisePartners(normalizeCards(r.data))).catch(() => setFranchisePartners([])),
    ]).finally(() => setLoading(false))
  }, [])

  const { partners, states } = useMemo(() => {
    // Attach the original index so each state keeps its colour while filtering.
    const indexed = (Array.isArray(contacts) ? contacts : []).map((c, i) => ({ ...c, _ci: i }))

    const q = norm(query)
    if (!q) return { partners: franchisePartners, states: indexed }

    const qd = onlyDigits(query)
    const hit = (values = [], phones = []) =>
      values.some((v) => norm(v).includes(q)) ||
      (qd.length >= 3 && phones.some((p) => onlyDigits(p).includes(qd)))

    const partners = franchisePartners
      .map((card) => ({
        ...card,
        persons: card.persons.filter((p) =>
          hit([p.name, p.location, p.services, 'service provider'], p.phones)
        ),
      }))
      .filter((card) => card.persons.length > 0)

    const states = indexed
      .map((sc) => {
        if (hit([sc.state])) return sc
        const districts = (sc.districts || [])
          .map((d) => {
            if (hit([d.district])) return d
            return { ...d, persons: (d.persons || []).filter((p) => hit([p.name], [p.phone])) }
          })
          .filter((d) => (d.persons || []).length > 0)
        return { ...sc, districts }
      })
      .filter((sc) => (sc.districts || []).length > 0)

    return { partners, states }
  }, [query, contacts, franchisePartners])

  // Flat list of every visible card: each service-provider person card,
  // followed by each state card. This is what gets paginated.
  const allCards = useMemo(() => {
    const personCards = partners.flatMap((card) =>
      card.persons.map((person, pi) => ({
        type: 'person',
        key: `p-${card._id}-${pi}-${person.name}`,
        person,
      }))
    )
    const stateCards = states.map((sc) => ({
      type: 'state',
      key: `s-${sc._id ?? sc._ci}`,
      stateCard: sc,
    }))
    return [...personCards, ...stateCards]
  }, [partners, states])

  const totalPages = Math.max(1, Math.ceil(allCards.length / CARDS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE
  const pageCards = allCards.slice(startIndex, startIndex + CARDS_PER_PAGE)
  const pagePersons = pageCards.filter((c) => c.type === 'person')
  const pageStates = pageCards.filter((c) => c.type === 'state')

  // Back to the first page whenever the search changes.
  useEffect(() => {
    setPage(1)
  }, [query])

  const goToPage = (p) => {
    setPage(Math.min(Math.max(p, 1), totalPages))
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const noResults = !loading && query.trim() && allCards.length === 0

  const navBtn =
    'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-theme bg-theme-card text-theme-primary transition-all hover:shadow-[0_8px_24px_rgba(37,99,235,0.12)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none'

  return (
    <div
      className="page-enter bg-theme-primary overflow-y-hidden"
      style={{ height: 'calc(100vh - 64px - 40px)' }}
    >
      <div
        ref={scrollRef}
        className="max-w-4xl mx-auto px-4 py-8 h-full overflow-y-auto scrollbar-hide"
      >

        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,68,68,0.08)' }}
          >
            <Phone size={22} strokeWidth={1.5} style={{ color: '#FF4444' }} />
          </div>
          <h1 className="text-theme-primary font-semibold text-xl leading-tight">
            Contact Us
          </h1>
        </div>

        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search by name, location, service or number..."
          className="mb-6"
        />

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-theme-card border border-theme rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : noResults ? (
          <div className="bg-theme-card border border-theme rounded-2xl py-12 px-4 flex flex-col items-center text-center gap-2">
            <SearchX size={28} className="text-theme-muted" />
            <p className="text-theme-primary font-semibold text-sm">No contacts found</p>
            <p className="text-theme-secondary text-xs">
              Try a different name, district, state, service or phone number.
            </p>
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-1 text-xs font-semibold text-accent hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {pagePersons.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                    style={{ background: `${FRANCHISE_COLOR}15` }}
                  >
                    <Store size={22} strokeWidth={1.5} style={{ color: FRANCHISE_COLOR }} />
                  </div>
                  <h2 className="text-theme-primary font-semibold text-xl leading-tight">
                    Service Provider
                  </h2>
                </div>

                <div
                  className="bg-theme-card border border-theme rounded-2xl overflow-hidden"
                  style={{ borderTop: `3px solid ${FRANCHISE_COLOR}` }}
                >
                  <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">
                    {pagePersons.map(({ key, person }) => (
                      <PersonCard key={key} person={person} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {pageStates.map(({ key, stateCard }) => (
              <StateCard key={key} stateCard={stateCard} />
            ))}

            {totalPages > 1 && (
              <nav
                aria-label="Contact pagination"
                className="flex items-center justify-between gap-3 pt-2 pb-2"
              >
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={navBtn}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="text-xs sm:text-sm text-theme-secondary font-medium">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={navBtn}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}

          </div>
        )}
      </div>
    </div>
  )
}