import React, { useState, useEffect } from 'react'
import { Phone, MapPin, Store } from 'lucide-react'
import api from '../../api'

const STATE_COLORS = ['#4488FF', '#FF4444', '#44DD88', '#FFD700', '#FF88AA', '#AA88FF']
const FRANCHISE_COLOR = '#FFD700'

export default function Contact() {
  const [contacts, setContacts] = useState([])
  const [franchisePartners, setFranchisePartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/contacts').then(r => setContacts(r.data)).catch(() => setContacts([])),
      api.get('/franchise-partners').then(r => setFranchisePartners(r.data)).catch(() => setFranchisePartners([])),
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
                  {franchisePartners.map((partner) => (
                    <div
                      key={partner._id}
                      className="bg-theme-card border border-theme rounded-2xl overflow-hidden"
                      style={{ borderTop: `3px solid ${FRANCHISE_COLOR}` }}
                    >
                      <div
                        className="flex items-center gap-3 px-5 py-4"
                        style={{ background: `${FRANCHISE_COLOR}10` }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: `${FRANCHISE_COLOR}20` }}
                        >
                          <MapPin size={16} style={{ color: FRANCHISE_COLOR }} />
                        </div>
                        <h3 className="text-theme-primary font-bold text-lg tracking-wide">
                          {partner.state}
                        </h3>
                      </div>

                      <div className="px-5 py-4 space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {partner.areas.map((area, ai) => (
                            <span
                              key={ai}
                              className="text-sm text-theme-secondary px-3 py-1 rounded-lg"
                              style={{ background: `${FRANCHISE_COLOR}10` }}
                            >
                              {area}
                            </span>
                          ))}
                        </div>

                        <div className="space-y-2 pt-1 border-t border-theme">
                          {partner.persons.map((p, pi) => (
                            <div key={pi} className="flex items-center justify-between gap-4 pt-3">
                              <span className="text-sm text-theme-primary font-medium">
                                {p.name}
                              </span>
                              <a
                                href={`tel:${p.phone}`}
                                className="flex items-center gap-1.5 text-sm font-mono transition-opacity hover:opacity-70"
                                style={{ color: FRANCHISE_COLOR }}
                              >
                                <Phone size={12} strokeWidth={2} />
                                {p.phone}
                              </a>
                            </div>
                          ))}
                        </div>
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
                                href={`tel:${p.phone}`}
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