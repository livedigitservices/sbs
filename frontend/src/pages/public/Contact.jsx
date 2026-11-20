import React, { useState, useEffect, useMemo } from 'react'
import { Phone, MapPin, Store, Briefcase, SearchX } from 'lucide-react'
import api from '../../api'
import { normalizeCards } from '../../utils/franchise'
import SearchBar from '../../components/SearchBar'

const STATE_COLORS = ['#4488FF', '#FF4444', '#44DD88', '#FFD700', '#FF88AA', '#AA88FF']
const FRANCHISE_COLOR = '#2563EB'

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

export default function Contact() {
  const [contacts, setContacts] = useState([])
  const [franchisePartners, setFranchisePartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

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

  const noResults = !loading && query.trim() && partners.length === 0 && states.length === 0

  return (
    <div
      className="page-enter bg-theme-primary overflow-y-hidden"
      style={{ height: 'calc(100vh - 64px - 40px)' }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 h-full overflow-y-auto scrollbar-hide">

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

            {partners.length > 0 && (
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

                <div className="space-y-6">
                  {partners.map((card) => (
                    <div
                      key={card._id}
                      className="bg-theme-card border border-theme rounded-2xl overflow-hidden"
                      style={{ borderTop: `3px solid ${FRANCHISE_COLOR}` }}
                    >
                      <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-start">
                        {card.persons.map((person, pi) => (
                          <PersonCard key={`${person.name}-${pi}`} person={person} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {states.map((stateCard) => {
              const color = STATE_COLORS[stateCard._ci % STATE_COLORS.length]
              return (
                <div
                  key={stateCard._id}
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
            })}

          </div>
        )}
      </div>
    </div>
  )
}