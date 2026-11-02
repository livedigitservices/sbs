import React from 'react'
import { useNavigate } from 'react-router-dom'
import HERO_IMAGE from '../../assets/guidance.jpg'

const solutions = [
  'Application Submission',
  'Tests & Exams',
  'Career Pathways',
  'Scholarships',
  'Stream Selection',
  'Abroad Study',
  'Study + Work',
  'Internships',
  'Placements',
  'Education Loan',
  'Abroad Work Permit',
]

/* Brand palette taken from the Guidance design — fixed across light/dark
   mode, same as the other branded service pages. */
const BG_TOP = '#02307a'
const BG_BOTTOM = '#003a96'
const PANEL = '#004dbf'
const YELLOW = '#f4c20d'
const RED = '#e8110f'

/* Design font (geometric sans). Loaded in index.html; Inter is the
   project-wide fallback. */
const FONT = "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif"

export default function Guidance() {
  const navigate = useNavigate()

  return (
    <div
      className="page-enter min-h-screen"
      style={{
        fontFamily: FONT,
        background: `linear-gradient(180deg, ${BG_TOP} 0%, ${BG_BOTTOM} 100%)`,
      }}
    >
      {/* Narrow poster on phones, wider on tablets / desktops */}
      <div className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl mx-auto">

        {/* Heading + intro over background image */}
        <div className="relative overflow-hidden px-5 sm:px-8 md:px-10 pt-8 sm:pt-10 md:pt-14 pb-8 md:pb-12">
          <img
            src={HERO_IMAGE}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${BG_TOP}b3 0%, ${BG_TOP}d9 90%, ${BG_TOP} 100%)`,
            }}
          />
          <div className="relative">
            <h1
              className="font-bold tracking-tight leading-tight mb-2 sm:mb-3 text-3xl sm:text-3xl md:text-5xl"
              style={{ color: YELLOW }}
            >
              Get Right Path
            </h1>
            <p className="text-white font-medium leading-relaxed text-[15px] sm:text-base md:text-lg lg:text-xl max-w-prose">
              A specialised structured process of understanding abilities, interests and
              choices with deeper emotional, behavioural &amp; social challenges to fix
              goals, which could make informed academic, career &amp; personal decisions.
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-8 md:px-10 pt-6 md:pt-8 pb-10 md:pb-14">

          {/* Find the best solutions */}
          <div
            className="rounded-xl md:rounded-2xl px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8 mb-8 md:mb-10"
            style={{ backgroundColor: PANEL }}
          >
            <h2
              className="font-extrabold uppercase tracking-wide mb-3 md:mb-5 text-base sm:text-lg md:text-2xl"
              style={{ color: YELLOW }}
            >
              Find the best solutions
            </h2>
            {/* One column on phones, two on tablets and up */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5 md:gap-y-3.5">
              {solutions.map(item => (
                <li
                  key={item}
                  className="flex items-baseline gap-3 text-white font-medium text-[15px] sm:text-base md:text-lg"
                >
                  <span aria-hidden="true">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Enquiry button */}
          <button
            onClick={() => navigate('/contact')}
            className="w-full sm:w-auto px-8 py-3.5 md:px-12 md:py-4 rounded-xl font-bold text-lg md:text-xl text-white transition hover:opacity-90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{ backgroundColor: RED }}
          >
            Enquiry Now!
          </button>
        </div>
      </div>
    </div>
  )
}