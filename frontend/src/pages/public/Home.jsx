import React from 'react'
import { Link } from 'react-router-dom'
import { Users, ShieldCheck, UserPlus, LogIn, ArrowRight, Phone } from 'lucide-react'

// Same source images already used on each service's own page, so the
// homepage preview looks consistent with where each card links to.
const TUTOR_IMG =
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80'
const DEGREE_IMG =
  'https://images.stockcake.com/public/e/e/c/eec11db7-afd9-4bbe-88ee-07002f666861_large/cozy-study-time-stockcake.jpg'
const PHD_IMG =
  'https://images.stockcake.com/public/e/7/4/e74c3df6-8b5e-46cd-a1cb-f3f455efcc8e_large/graduation-cap-toss-stockcake.jpg'

const BLUE = '#2563EB'

// Same vivid blue gradient used on the Online Tutors page, so the homepage
// reads consistently with where its cards link to.
const PAGE_BG = 'linear-gradient(180deg, #1E63B8 0%, #123A7A 45%, #0A1E3F 100%)'

const SERVICE_CARDS = [
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
    to: '/phd-admissions',
    image: PHD_IMG,
    tag: 'Add Dr. to your name',
    title: 'Ph.D Admissions',
    desc: 'Full Time / Part Time / Online / Fully Funded / Research / Honorary Ph.D',
  },
]

export default function Home() {
  return (
    <div className="page-enter h-full flex flex-col" >
      {/* Top bar */}
      <header className="text-white" >
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

      {/* Services */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:py-10">
        <div className="flex flex-row flex-wrap gap-4">
          {SERVICE_CARDS.map(({ to, image, tag, title, desc }) => (
            <Link
              key={to}
              to={to}
              className="group relative flex-1 min-w-[280px] rounded-2xl overflow-hidden min-h-[200px] flex flex-col justify-end shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(15,23,42,0.55) 55%, rgba(15,23,42,0.92) 100%)' }}
              />
              <div className="relative p-5 text-white">
                <span
                  className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full mb-2"
                  style={{ backgroundColor: BLUE }}
                >
                  {tag}
                </span>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-xs text-white/85 leading-relaxed mb-3">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}