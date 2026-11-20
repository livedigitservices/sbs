import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ShieldCheck, UserPlus, LogIn, Bell, SearchX, ChevronRight } from 'lucide-react'
import GUIDANCE_IMG from '../../assets/guidance.jpg'
import api from '../../api'
import SearchBar from '../../components/SearchBar'

const TUTOR_IMG =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80'
const DEGREE_IMG =
  'https://images.stockcake.com/public/e/e/c/eec11db7-afd9-4bbe-88ee-07002f666861_large/cozy-study-time-stockcake.jpg'
const PHD_IMG =
  'https://images.stockcake.com/public/e/7/4/e74c3df6-8b5e-46cd-a1cb-f3f455efcc8e_large/graduation-cap-toss-stockcake.jpg'

const BLUE = '#2563EB'

// Where a click on any notification takes the user.
const NOTICE_LINK = '/associate-resources'

// Fallback notifications. If the Settings collection has a `notifications`
// key (array of strings or { text }), those are shown instead.
const DEFAULT_NOTICES = [
  '2026 Admissions Closing soon hurry-up for last seats',
  'Master Classes on Online Business scheduled every month registerations open',
  'Franchise Partners Connect Program at Hyderabad & Vizag contact new associates',
  'List your business with us to promote globally ',
  'Online Bulk Resellers opportunity low investment regular income',
]

const SERVICE_CARDS = [
  {
    to: '/online-reseller',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    tag: 'Earn Smater',
    title: 'Online Business',
    desc: 'Bulk SMS | WhatsApp | AI | Ionizers | Agri | Many',
  },
  {
    to: '/online-admissions',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80',
    tag: 'Top Rated Colleges',
    title: 'Online Admissions',
    desc: 'Medical | Engineering | Pharma | Agriculture | Management | Ayush',
  },
  {
    to: '/tutors',
    image: TUTOR_IMG,
    tag: 'Find your expert',
    title: 'Online Tutors',
    desc: 'Tutor / Trainer / Teacher / Coach / Mentor / Advisor / Counsellor',
  },
  {
    to: '/online-degrees',
    image: DEGREE_IMG,
    tag: 'Study online',
    title: 'Online Degrees',
    desc: 'BA · B.Com · BBA · BCA · MA · M.Com · MBA · MCA',
  },
  {
    to: '/guidance',
    image: GUIDANCE_IMG,
    tag: 'Find Your Right Path',
    title: 'Online Guidance',
    desc: 'Education | Careers | Admissions | Exams',
  },
  {
    to: '/phd-admissions',
    image: PHD_IMG,
    tag: 'Add Dr. to your name',
    title: 'Online Ph.D',
    desc: 'Full Time / Part Time / Online / Fully Funded / Research / Honorary Ph.D',
  },
]

const normalizeNotices = (raw) => {
  if (!Array.isArray(raw)) return []
  return raw
    .map((n) => (typeof n === 'string' ? n : n?.text))
    .map((t) => (t || '').trim())
    .filter(Boolean)
}

function NotificationCard({ notices }) {
  // List is rendered twice so the -50% translate loops seamlessly.
  const loop = [...notices, ...notices]
  const duration = Math.max(notices.length * 5, 14)

  return (
    <section
      aria-label="What's New"
      className="bg-theme-card border border-theme rounded-2xl overflow-hidden shadow-sm"
      style={{ borderTop: `3px solid ${BLUE}` }}
    >
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-1">
        <span
          className="relative w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${BLUE}15` }}
        >
          <Bell size={16} style={{ color: BLUE }} />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 pulse-call" />
        </span>
        <h2 className="text-theme-primary font-semibold text-base">What's New</h2>
      </div>

      <div className="notice-viewport relative h-[112px] sm:h-[120px] overflow-hidden px-4">
        <ul
          className="notice-track"
          style={{ '--notice-duration': `${duration}s` }}
        >
          {loop.map((text, i) => (
            <li key={i} aria-hidden={i >= notices.length}>
              <Link
                to={NOTICE_LINK}
                tabIndex={i >= notices.length ? -1 : 0}
                className="group flex items-start gap-2.5 py-2.5 text-sm text-theme-secondary leading-snug transition-colors hover:text-accent cursor-pointer"
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: BLUE }}
                />
                <span className="min-w-0 flex-1 break-words">{text}</span>
                <ChevronRight
                  size={16}
                  className="shrink-0 mt-0.5 text-theme-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [notices, setNotices] = useState(DEFAULT_NOTICES)

  useEffect(() => {
    let active = true
    api
      .get('/settings')
      .then((r) => {
        const list = normalizeNotices(r.data?.notifications)
        if (active && list.length) setNotices(list)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const filteredCards = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return SERVICE_CARDS
    return SERVICE_CARDS.filter(({ title, tag, desc }) =>
      `${title} ${tag} ${desc}`.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="page-enter h-full flex flex-col">
      {/* Top bar */}
      <header className="text-white">
        <div className="max-w-3xl mx-auto px-2 py-3">
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              to="/associate/register"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-black bg-white/15 border border-black/30 transition-all hover:bg-white/25"
            >
              <UserPlus size={15} />
              Associate Registration
            </Link>
            <Link
              to="/associate/login"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-black bg-white/15 border border-black/30 transition-all hover:bg-white/25"
            >
              <LogIn size={15} />
              Associate Login
            </Link>
            <Link
              to="/associate-resources"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-black bg-white/15 border border-black/30 transition-all hover:bg-white/25"
            >
              <Users size={15} />
              Associate Resources
            </Link>
            <Link
              to="/admin/login"
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-black bg-white/15 border border-black/30 transition-all hover:bg-white/25"
            >
              <ShieldCheck size={15} />
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:py-6">
        {/* Notifications */}
        <div className="mb-3">
          <NotificationCard notices={notices} />
        </div>

        {/* Service search */}
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search services..."
          className="mb-4"
        />

        {/* Services */}
        {filteredCards.length === 0 ? (
          <div className="bg-theme-card border border-theme rounded-2xl py-10 px-4 flex flex-col items-center text-center gap-2">
            <SearchX size={28} className="text-theme-muted" />
            <p className="text-theme-primary font-semibold text-sm">No services found</p>
            <p className="text-theme-secondary text-xs">
              Try a different keyword like "degree", "tutor" or "admission".
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
          <div className="flex flex-row flex-wrap gap-2 pb-3">
            {filteredCards.map(({ to, image, tag, title, desc }) => (
              <Link
                key={to}
                to={to}
                className="group relative flex-1 min-w-[280px] rounded-2xl overflow-hidden min-h-[200px] flex flex-col justify-end shadow-md hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(15,23,42,0.55) 55%, rgba(15,23,42,0.92) 100%)',
                  }}
                />
                <div className="relative p-5 text-white flex flex-col items-center uppercase">
                  <h3 className="text-3xl font-bold mb-4">{title}</h3>
                  <span
                    className="inline-block text-[15px] font-semibold px-2.5 rounded-full mb-4"
                    style={{ backgroundColor: BLUE }}
                  >
                    {tag}
                  </span>
                  <p className="text-[17px] text-white/85 leading-relaxed mb-2">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}