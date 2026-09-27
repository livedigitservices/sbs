import React from 'react'
import { useNavigate } from 'react-router-dom'

const phdTypes = [
  'Regular Ph.D',
  'Fully Funded Ph.D',
  'Part Time / Online Ph.D',
]

const weHelpYou = [
  'University Selection',
  'Eligibility Test',
  'Research Topic',
  'Synopsis',
  'Publications & Presentations',
  'Research Papers',
  'Thesis',
]

/* Free-to-use stock graduation photos (StockCake, no attribution required) */
const HERO_IMAGE =
  'https://images.stockcake.com/public/e/7/4/e74c3df6-8b5e-46cd-a1cb-f3f455efcc8e_large/graduation-cap-toss-stockcake.jpg'
const CAPS_IMAGE =
  'https://images.stockcake.com/public/1/9/4/194889ef-3c87-407f-9764-63cdd79188aa_large/graduation-joy-celebration-stockcake.jpg'

/* Brand palette from the reference PDF — kept fixed across light/dark mode
   since this page is a self-contained branded poster, same treatment as
   the hero banners on the other static service pages. */
const NAVY = '#0b1f4d'
const BLUE = '#1e3a8a'
const YELLOW = '#f4c542'
const RED = '#dc2626'

export default function PhdAdmissions() {
  const navigate = useNavigate()

  return (
    <div className="page-enter min-h-screen" style={{ backgroundColor: NAVY }}>
      <div className="max-w-xl mx-auto">

        {/* Hero */}
        <div className="relative overflow-hidden">
          <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${NAVY}99 0%, ${NAVY}cc 55%, ${NAVY} 100%)`,
            }}
          />
          <div className="relative px-6 pt-14 pb-8">
            <p className="font-extrabold text-3xl leading-none mb-1" style={{ color: YELLOW }}>add</p>
            <h1 className="font-extrabold text-4xl leading-none mb-3">
              <span style={{ color: YELLOW }}>DR.</span>
              <span className="text-white">to your name</span>
            </h1>
            <p className="text-white/90 text-sm leading-relaxed">
              Explore Ph.D eligibility, courses, scholarships fees &amp; funding for research.
              Make your career progress to higher level &amp; prove your research abilities to
              be recognised as one who made the contribution to the society.
            </p>
          </div>
        </div>

        {/* Caps photo + Ph.D type buttons */}
        <div className="relative py-8 px-5" style={{ minHeight: 420 }}>
          <img src={CAPS_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${NAVY}55 0%, ${NAVY}22 40%, ${NAVY}88 100%)` }}
          />
          <div className="relative pt-10">
            <div className="grid grid-cols-3 gap-3 mb-3">
              {phdTypes.map(label => (
                <div
                  key={label}
                  className="rounded-xl flex items-center justify-center text-center px-2 py-4"
                  style={{ backgroundColor: BLUE }}
                >
                  <span className="text-white text-[13px] font-bold leading-tight">{label}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <div
                className="rounded-xl flex items-center justify-center text-center px-8 py-5"
                style={{ backgroundColor: BLUE, width: '66%' }}
              >
                <span className="text-white text-xl font-bold">Honorary Ph.D</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-10">

          {/* Field of interest box */}
          <div
            className="rounded-2xl px-6 py-6 text-center mt-2 mb-8"
            style={{ border: '1.5px solid rgba(255,255,255,0.35)', backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <p className="text-white text-sm leading-relaxed mb-1">
              Get Ph.d in your field of interest
            </p>
            <p className="text-white text-sm leading-relaxed">
              &middot; Arts, Science, Management, Engineering, any subjects<br />
              or any field of your interest
            </p>
          </div>

          {/* We Help You */}
          <div className="mb-8">
            <div className="inline-block rounded-r-full pl-4 pr-8 py-2.5 mb-5 -ml-5" style={{ backgroundColor: '#2563eb' }}>
              <h2 className="text-white font-bold text-lg tracking-wide">WE HELP YOU</h2>
            </div>
            <ul className="space-y-3">
              {weHelpYou.map(item => (
                <li key={item} className="flex items-baseline gap-2">
                  <span className="text-white text-sm">&middot;</span>
                  <span className="text-white text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enquiry button */}
          <button
            onClick={() => navigate('/contact')}
            className="w-full py-4 rounded-xl font-bold text-base text-white transition hover:opacity-90"
            style={{ backgroundColor: RED }}
          >
            Enquiry Now!
          </button>
        </div>
      </div>
    </div>
  )
}