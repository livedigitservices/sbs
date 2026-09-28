import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarClock, Briefcase, Laptop, Award,
} from 'lucide-react'
import PopupForm from '../../components/PopupForm'
import LogoScroller from '../../components/LogoScroller'

/* ---------------------------------- DATA ---------------------------------- */

const courseCodes = ['BA', 'BCOM', 'BBA', 'BCA', 'MA', 'MCOM', 'MBA', 'MCA']

const undergraduate = [
  { code: 'BA', name: 'Bachelor of Arts' },
  { code: 'BBA', name: 'Bachelor of Business Administration' },
  { code: 'B.COM', name: 'Bachelor of Commerce' },
  { code: 'BCA', name: 'Bachelor of Computer Applications' },
]

const postgraduate = [
  { code: 'MA', name: 'Master of Arts' },
  { code: 'MBA', name: 'Master of Business Administration' },
  { code: 'M.COM', name: 'Master of Commerce' },
  { code: 'MCA', name: 'Master of Computer Applications' },
]

const whyOnline = [
  { icon: CalendarClock, title: 'Flexible Learning', desc: 'Study according to your schedule and location.' },
  { icon: Briefcase, title: 'Career-Friendly', desc: 'Continue working while pursuing higher education.' },
  { icon: Laptop, title: 'Digital Learning', desc: 'Access course content and learning resources online.' },
  { icon: Award, title: 'Professional Development', desc: 'Build qualifications and knowledge to support your career goals.' },
]

const howSbsHelps = [
  { num: '1', title: 'Course Selection', desc: 'Find programs aligned with your education and career goals.' },
  { num: '2', title: 'University Guidance', desc: 'Explore available university and institution options.' },
  { num: '3', title: 'Eligibility Guidance', desc: 'Understand admission requirements for your selected course.' },
  { num: '4', title: 'Application Assistance', desc: 'Get support with applications and required documentation.' },
  { num: '5', title: 'Admission Support', desc: 'Receive guidance throughout the admission process.' },
]

/* ------------------------------- IMAGES ------------------------------- */
// Free-to-use stock images (StockCake, no attribution required)
const HERO_IMG = 'https://images.stockcake.com/public/e/e/c/eec11db7-afd9-4bbe-88ee-07002f666861_large/cozy-study-time-stockcake.jpg'
const WHY_IMG = 'https://images.stockcake.com/public/b/e/d/beda1f28-36e8-444b-bdba-ea1a7e16f5d9_large/reading-in-nature-stockcake.jpg'

/* -------------------------------- PALETTE --------------------------------
   Brand red/maroon from the reference PDF. These are used as literal
   background fills (photo overlays, panels) which look right unchanged in
   both modes. Anywhere the color sits directly on the page background
   (plain text, borders, notes) gets a `dark:` companion below so contrast
   holds up on a dark surface.
------------------------------------------------------------------------- */
const RED = '#E32619'
const RED_DARK = '#B01810'
const MAROON = '#3B0808'
const MAROON_DEEP = '#1E0404'

/* ------------------------------- SUBCOMPONENTS ----------------------------- */

// `dark` here means "this section already sits on a dark photo/gradient",
// not the site's dark mode — it always renders white text.
function SectionHeading({ children, dark = false }) {
  return (
    <h2
      className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-wide mb-6 pb-2 inline-block border-b-4 ${
        dark
          ? 'text-white border-white/40'
          : 'text-[#E32619] dark:text-[#FF6E5F] border-[#E32619]/30 dark:border-[#FF6E5F]/40'
      }`}
    >
      {children}
    </h2>
  )
}

function RedButton({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-full font-extrabold text-sm bg-[#E32619] dark:bg-[#FF3B2B] text-white hover:bg-[#B01810] dark:hover:bg-[#E32619] transition shadow-md ${className}`}
    >
      {children}
    </button>
  )
}

/* ---------------------------------- PAGE ----------------------------------- */

export default function OnlineDegrees() {
  const navigate = useNavigate()
  const [panel, setPanel] = useState({ open: false, degree: null })

  const openEnquiry = (title) =>
    setPanel({ open: false, degree: { _id: title, title, university: 'SBS – Sai Business Services' } })

  return (
    <div className="page-enter bg-theme-primary min-h-screen">

      {/* ---------------- HERO ---------------- */}
      {/* Photo + dark overlay reads correctly unchanged in both modes */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(115deg, ${MAROON_DEEP}ee 35%, ${RED}99 100%)` }}
        />
        <div className="relative max-w-3xl mx-auto px-6 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <h1 className="text-white font-extrabold leading-[1.05] text-4xl sm:text-6xl mb-6">
            Learn<br />Up-Skill<br />Advance Your Career
          </h1>
          <p className="text-white/90 text-base sm:text-lg max-w-xl">
            Explore flexible online degree programs designed for students, working professionals
            and individuals looking to upgrade their qualifications.
          </p>
        </div>
      </section>

      {/* ---------------- EXPLORE COURSES ---------------- */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <SectionHeading>Explore Courses</SectionHeading>

        <div className="rounded-2xl p-6 sm:p-8 mb-6" style={{ backgroundColor: RED }}>
          <p className="text-white font-extrabold text-lg mb-5">Under Graduate</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {undergraduate.map(c => (
              <button
                key={c.code}
                onClick={() => openEnquiry(`${c.code} – ${c.name}`)}
                className="bg-white rounded-xl py-4 px-2 text-center hover:scale-[1.03] transition"
              >
                <p className="font-extrabold" style={{ color: RED }}>{c.code}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-6 sm:p-8" style={{ backgroundColor: MAROON }}>
          <p className="text-white font-extrabold text-lg mb-5">Post Graduate</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {postgraduate.map(c => (
              <button
                key={c.code}
                onClick={() => openEnquiry(`${c.code} – ${c.name}`)}
                className="rounded-xl py-4 px-2 text-center hover:scale-[1.03] transition"
                style={{ backgroundColor: RED_DARK }}
              >
                <p className="text-white font-extrabold">{c.code}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- WHY CHOOSE ONLINE EDUCATION ---------------- */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: `url(${WHY_IMG})` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(100deg, ${MAROON_DEEP}e6 45%, ${MAROON_DEEP}55 100%)` }}
        />
        <div className="relative max-w-5xl mx-auto px-6 py-16">
          <SectionHeading dark>Why Choose Online Education?</SectionHeading>
          <div className="flex flex-col gap-6 max-w-lg">
            {whyOnline.map((w, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
                  <w.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white lowercase">{w.title}</p>
                  <p className="text-white/80 text-sm leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- HOW SBS HELPS YOU ---------------- */}
      <section
        className="relative"
        style={{ background: `linear-gradient(135deg, ${MAROON_DEEP} 0%, ${MAROON} 45%, ${RED_DARK} 100%)` }}
      >
        <div className="max-w-5xl mx-auto px-6 py-16">
          <SectionHeading dark>How We Help You?</SectionHeading>

          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 mb-10">
            {howSbsHelps.map(step => (
              <div key={step.num}>
                <p className="text-white font-bold mb-1">
                  <span className="mr-2">{step.num}.</span>{step.title}
                </p>
                <p className="text-white/75 text-sm leading-relaxed pl-5">{step.desc}</p>
              </div>
            ))}
            <div className="flex items-start sm:items-end">
              <RedButton onClick={() => navigate('/contact')}>Enquire Now!</RedButton>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TAGLINE ---------------- */}
      <section className="bg-theme-primary py-10">
        <p className="text-center font-extrabold text-lg sm:text-xl text-[#E32619] dark:text-[#FF6E5F]">
          Your Education. Our Guidance.
        </p>
      </section>

      {/* ---------------- START YOUR ONLINE EDUCATION JOURNEY ---------------- */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-2 leading-tight text-[#3B0808] dark:text-white">
          Start Your Online Education Journey
        </h2>
        <p className="text-lg mb-6 text-[#E32619] dark:text-[#FF6E5F]">Your Next Qualification Is Just A Step Away.</p>
        <p className="text-theme-secondary mb-8 leading-relaxed">
          Explore online programs that match your{' '}
          <strong className="text-[#3B0808] dark:text-white">career goals, educational background, and schedule</strong>.
        </p>

        <p className="text-xs font-bold uppercase tracking-wide text-theme-secondary mb-2">Popular Programs</p>
        <p className="font-bold mb-6 text-[#3B0808] dark:text-white">{courseCodes.join(' | ')}</p>

        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <RedButton onClick={() => navigate('/contact')}>Explore Courses</RedButton>
          <RedButton onClick={() => navigate('/contact')}>Apply Now</RedButton>
        </div>

        <div className="rounded-xl p-5 text-left bg-[#FBEAE8] dark:bg-[#3B0808]/40">
          <p className="text-theme-secondary text-sm leading-relaxed">
            <strong className="text-[#3B0808] dark:text-[#FF6E5F]">Note:</strong> Course availability, fees,
            duration, eligibility, recognition, and admission requirements vary by university and
            program. Verify current details with the respective institution before applying.
          </p>
        </div>
      </section>

      <LogoScroller label="University Partners" accent={RED} logoKey="degreeLogos" />

      <PopupForm
        open={panel.open}
        onClose={() => setPanel({ open: false, degree: null })}
        type="degree"
        refId={panel.degree?._id}
        refTitle={panel.degree ? `${panel.degree.title} – ${panel.degree.university}` : ''}
      />
    </div>
  )
}