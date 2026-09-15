import React, { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Users, ShieldCheck, Search, UserPlus, LogIn } from 'lucide-react'
import { CORE_SERVICES, HOME_EXTRA_SERVICES } from '../../constants/coreServices'


const ALL_HOME_SERVICES = [...CORE_SERVICES, ...HOME_EXTRA_SERVICES]

// How long the pointer rests on each service before moving to the next one.
const POINTER_INTERVAL_MS = 2200

// One distinct cool-tone color per service — sized to ALL_HOME_SERVICES
// (19 entries) so nothing repeats. If services are added later, add a new
// cool hex here too, or colors will start cycling again.
const SERVICE_COLORS = [
  '#E11D48', // Rose
  '#EA580C', // Orange
  '#CA8A04', // Amber
  '#65A30D', // Lime
  '#16A34A', // Green
  '#0D9488', // Teal
  '#0891B2', // Cyan
  '#0284C7', // Sky Blue
  '#2563EB', // Blue
  '#4F46E5', // Indigo
  '#7C3AED', // Violet
  '#9333EA', // Purple
  '#C026D3', // Fuchsia
  '#DB2777', // Pink
  '#B91C1C', // Red
  '#92400E', // Brown
  '#475569', // Slate
  '#334155', // Dark Slate
  '#0F766E', // Dark Teal
];  

export default function Home() {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [pointerPos, setPointerPos] = useState(null) // { top, left, height }
  const listRef = useRef(null)
  const itemRefs = useRef([])

  const filteredServices = ALL_HOME_SERVICES.filter(({ label }) =>
    label.toLowerCase().includes(query.trim().toLowerCase())
  )

  // Whenever the visible list changes (e.g. the visitor types a search
  // query), snap the pointer back to the first result so it never points
  // at a service that's no longer shown.
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Continuously cycle the pointer through the visible services.
  useEffect(() => {
    if (filteredServices.length < 2) return
    const id = setInterval(() => {
      setActiveIndex(i => (i + 1) % filteredServices.length)
    }, POINTER_INTERVAL_MS)
    return () => clearInterval(id)
  }, [filteredServices.length])

  // Measure the highlighted item's position so the pointer can smoothly
  // glide to it. Re-measures on resize too, since the grid can reflow.
  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[activeIndex]
      if (!el) { setPointerPos(null); return }
      setPointerPos({ top: el.offsetTop, left: el.offsetLeft, height: el.offsetHeight })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [activeIndex, filteredServices.length])

  // Colors are matched to each service by its position in the FULL list
  // (not the filtered one), so a given service keeps the same color
  // whether or not a search query is narrowing the results.
  const colorByTo = ALL_HOME_SERVICES.reduce((map, { to }, i) => {
    map[to] = SERVICE_COLORS[i % SERVICE_COLORS.length]
    return map
  }, {})

  return (
    <div className="page-enter bg-theme-primary min-h-full flex flex-col items-center px-4 py-10">
      <section className="w-full max-w-xl">

        {/* Top actions */}
        <div className="flex items-center justify-between mb-10 gap-3">
          <Link
            to="/associate-resources"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
            style={{ backgroundColor: '#2563EB' }}
          >
            <Users size={16} />
            Associate Resources
          </Link>

          <Link
            to='/admin/login'
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ backgroundColor: '#0F766E' }}
          >
            <ShieldCheck size={16} />
            Admin Login
          </Link>
        </div>

        {/* Associate Portal */}
        <div
          className="rounded-2xl p-5 mb-6 text-white"
          style={{ backgroundColor: '#4F46E5' }}
        >
          <p className="font-bold text-sm mb-1">Associate Portal</p>
          <p className="text-white/80 text-xs mb-4">
            Register as associate to manage your leads, track their progress, and grow your business with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <Link
              to="/associate/register"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{ backgroundColor: '#059669' }}
            >
              <UserPlus size={16} />
              Associate Registration
            </Link>
            <Link
              to="/associate/login"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:brightness-110"
              style={{ backgroundColor: '#1D4ED8' }}
            >
              <LogIn size={16} />
              Associate Login
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-transparent border border-theme text-theme-primary text-sm placeholder:text-theme-muted focus:outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>

        {/* Services list - two columns, each tile its own color */}
        {filteredServices.length > 0 ? (
          <ul ref={listRef} className="relative grid grid-cols-2 gap-2.5">
            {pointerPos && (
              <span
                aria-hidden="true"
                className="services-pointer absolute text-base leading-none select-none pointer-events-none transition-all duration-700 ease-in-out z-10"
                style={{
                  top: pointerPos.top + pointerPos.height / 2 - 9,
                  left: Math.max(pointerPos.left - 20, -18),
                }}
              >
                👆
              </span>
            )}
            {filteredServices.map(({ to, label }, i) => {
              const isActive = i === activeIndex
              return (
                <li key={to} ref={el => (itemRefs.current[i] = el)} className="min-w-0">
                  <Link
                    to={to}
                    className={`whitespace-pre-line flex items-start gap-2 py-2.5 px-3 rounded-lg text-sm text-white min-w-0 transition-all duration-500 ${
                      isActive ? 'ring-2 ring-white/80 scale-[1.02]' : ''
                    }`}
                    style={{ backgroundColor: colorByTo[to] }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/90 shrink-0 mt-1.5" />
                    <span className="break-words">{label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-theme-muted text-sm text-center py-4">No services found.</p>
        )}
      </section>
    </div>
  )
}