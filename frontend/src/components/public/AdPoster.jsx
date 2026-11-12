import React from 'react'
import { useNavigate } from 'react-router-dom'

// Brand palette taken from the reference PDFs
const BLUE = '#0047BB'
const NAVY = '#002F87'
const YELLOW = '#EBC428'
const RED = '#E60C0C'

// Shared poster layout for Online Reseller / Online Admissions.
//  • Phones:   single column, same order as the PDF.
//  • Tablets:  wider column, list splits into two columns.
//  • Desktop:  full-width hero, intro + perks + button on the left,
//              the list card on the right.
export default function AdPoster({
  image, title, badge, headline,
  introTitle, intro,
  listTitle, items, extraLines, boldLine, perks,
}) {
  const navigate = useNavigate()

  return (
    <div className="page-enter min-h-screen"
      style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${BLUE} 100%)` }}>
      <div className="w-full max-w-xl md:max-w-3xl lg:max-w-6xl mx-auto text-white lg:px-6 lg:pt-6">

        {/* Hero image */}
        <div className="h-56 sm:h-72 lg:h-[26rem] overflow-hidden lg:rounded-2xl"
          style={{ backgroundColor: NAVY }}>
          <img src={image} alt="" className="w-full h-full object-cover" loading="eager" />
        </div>

        {/* Title panel */}
        <div className="rounded-xl lg:rounded-2xl px-4 pt-5 pb-6 lg:py-8 text-center lg:mt-6"
          style={{ backgroundColor: BLUE }}>
          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight">
            {title}
          </h1>
          <div className="mt-3 lg:mt-4 mx-auto lg:max-w-3xl rounded-lg py-2 text-black text-lg lg:text-xl uppercase"
            style={{ backgroundColor: YELLOW }}>
            {badge}
          </div>
          <div className="mt-4 font-bold text-lg sm:text-xl lg:text-2xl leading-snug">
            {headline.map((line) => <p key={line}>{line}</p>)}
          </div>
        </div>

        {/* Content: stacked on small screens, two columns on desktop */}
        <div className="px-4 sm:px-6 lg:px-0 pt-7 lg:pt-8 pb-12 grid gap-6 lg:grid-cols-2 lg:gap-x-10 lg:items-start">

          {/* Intro */}
          <div className="lg:col-start-1 lg:row-start-1">
            <h2 className="font-semibold text-lg lg:text-2xl mb-1 lg:mb-3">{introTitle}</h2>
            <p className="text-[15px] lg:text-lg leading-relaxed text-white/90">{intro}</p>
          </div>

          {/* List card */}
          <div className="rounded-2xl px-5 py-5 lg:px-8 lg:py-7 lg:col-start-2 lg:row-start-1 lg:row-span-3"
            style={{ backgroundColor: BLUE }}>
            <h2 className="font-bold text-base sm:text-lg lg:text-xl uppercase mb-3" style={{ color: YELLOW }}>
              {listTitle}
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[15px] lg:text-base sm:columns-2 lg:columns-1 sm:gap-x-8">
              {items.map((item) => <li key={item} className="break-inside-avoid">{item}</li>)}
            </ul>

            {extraLines && (
              <div className="mt-5 text-center text-[14px] lg:text-base space-y-1.5">
                {extraLines.map((line) => <p key={line}>{line}</p>)}
                {boldLine && <p className="font-bold">{boldLine}</p>}
              </div>
            )}
          </div>

          {/* Perks */}
          {perks && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 font-bold text-base sm:text-lg lg:text-xl uppercase lg:col-start-1 lg:row-start-2"
              style={{ color: YELLOW }}>
              {perks.map((perk) => <p key={perk}>* {perk}</p>)}
            </div>
          )}

          {/* CTA */}
          <div className="lg:col-start-1 lg:row-start-3">
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto sm:px-12 py-3.5 rounded-xl font-bold text-lg transition hover:opacity-90 active:scale-[0.98]"
              style={{ backgroundColor: RED }}
            >
              Enquiry Now!
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}