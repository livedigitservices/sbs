import React, { useState, useEffect } from 'react'
import { Phone, MapPin, Store, ChevronDown } from 'lucide-react'
import api from '../../api'
import { normalizeCards } from '../../utils/franchise'

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

const AREAS_PREVIEW = 6

function PersonCard({ person }) {
  const [showAll, setShowAll] = useState(false)
  const areas = person.areas || []
  const visible = showAll ? areas : areas.slice(0, AREAS_PREVIEW)
  const phones = person.phones || []

  return (
    <div className="bg-theme-card border border-theme rounded-2xl overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(37,99,235,0.10)]">
      {/* 1. Pincode + area lines on top (this person only) */}
      {areas.length > 0 && (
        <div className="px-4 sm:px-5 pt-4 pb-3" style={{ background: `${FRANCHISE_COLOR}06` }}>
          <ul className="space-y-2">
            {visible.map((a, i) => (
              <li key={i} className="flex items-baseline gap-3 text-sm">
                {a.pincode ? (
                  <span
                    className="shrink-0 font-mono font-semibold tabular-nums"
                    style={{ color: FRANCHISE_COLOR }}
                  >
                    {a.pincode}
                  </span>
                ) : null}
                <span className="text-theme-primary min-w-0 break-words">{a.area}</span>
              </li>
            ))}
          </ul>

          {areas.length > AREAS_PREVIEW && (
            <button
              type="button"
              onClick={() => setShowAll(s => !s)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: FRANCHISE_COLOR }}
            >
              {showAll ? 'Show less' : `Show all ${areas.length} areas`}
              <ChevronDown size={14} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      )}

      {/* 2. Below: person name on the left, mobile number(s) on the right */}
      <div className="border-t border-theme px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-auto">
        <span className="text-theme-primary font-semibold text-sm">{person.name}</span>
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
    </div>
  )
}

export default function Contact() {
  const [contacts, setContacts] = useState([])
  const [franchisePartners, setFranchisePartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/contacts').then(r => setContacts(r.data)).catch(() => setContacts([])),
      api.get('/franchise-partners').then(r => setFranchisePartners(normalizeCards(r.data))).catch(() => setFranchisePartners([])),
    ]).finally(() => setLoading(false))
  }, [])

  return (
    <div
      className="page-enter bg-theme-primary overflow-y-hidden"
      style={{ height: 'calc(100vh - 64px - 40px)' }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8 h-full overflow-y-auto scrollbar-hide">

        <div className="flex items-center gap-4 mb-8">
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

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-theme-card border border-theme rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">


            {franchisePartners.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                    style={{ background: `${FRANCHISE_COLOR}15` }}
                  >
                    <Store size={22} strokeWidth={1.5} style={{ color: FRANCHISE_COLOR }} />
                  </div>
                  <h2 className="text-theme-primary font-semibold text-xl leading-tight">
                    Franchise Partners
                  </h2>
                </div>

                <div className="space-y-6">
                  {franchisePartners.map((card) => (
                    <div
                      key={card._id}
                      className="bg-theme-card border border-theme rounded-2xl overflow-hidden"
                      style={{ borderTop: `3px solid ${FRANCHISE_COLOR}` }}
                    >
                      <div
                        className="flex items-center gap-3 px-4 sm:px-5 py-4"
                        style={{ background: `${FRANCHISE_COLOR}10` }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: `${FRANCHISE_COLOR}20` }}
                        >
                          <MapPin size={16} style={{ color: FRANCHISE_COLOR }} />
                        </div>
                        <h3 className="text-theme-primary font-bold text-lg tracking-wide flex-1 min-w-0 truncate">
                          {card.state}
                        </h3>
                        <span className="text-xs font-semibold text-theme-secondary shrink-0">
                          {card.persons.length} partner{card.persons.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* One separate card per person, newest first (as ordered by the admin) */}
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
            {contacts.map((stateCard, si) => {
              const color = STATE_COLORS[si % STATE_COLORS.length]
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
                    {stateCard.districts.map((d, di) => (
                      <div key={di} className="px-5 py-4">
                        <p
                          className="text-xs font-semibold uppercase tracking-widest mb-3"
                          style={{ color }}
                        >
                          {d.district}
                        </p>

                        <div className="space-y-2">
                          {d.persons.map((p, pi) => (
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