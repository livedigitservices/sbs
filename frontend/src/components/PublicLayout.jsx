import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Phone, MapPin, Headset, Home } from 'lucide-react'
import api, { associateLogout } from '../api'

const NAVY_BLUE = '#2563EB'

export default function PublicLayout() {
  const [cities, setCities] = useState(['Vizag','Eluru','Khammam','Hyderabad','Vijayawada','Guntur','Warangal'])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/settings').then(r => {
      if (r.data.cities) setCities(r.data.cities)
    }).catch(() => {})
  }, [])

  // If an associate is signed in, clicking Home should securely end that
  // session before returning to the public site — not just navigate away
  // while the session is still live.
  const handleHomeClick = async (e) => {
    const associateToken = localStorage.getItem('sbs_associate_token')
    if (!associateToken) return
    e.preventDefault()
    await associateLogout(navigate)
  }

  const ticker = [...cities, ...cities]

  // Navbar is always blue with white text/icons; the page body is a plain
  // white/off-white background.
  const supportBtn = 'bg-white text-[#2563EB] hover:bg-white/90'
  const iconBtn = 'text-white hover:bg-white/15'

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2]"
      style={{ paddingTop: 0, paddingBottom: 0 }}>

      {/* ── NAVBAR ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur transition-colors duration-300"
        style={{ backgroundColor: NAVY_BLUE }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <p className='font-extrabold text-3xl text-amber-50' >www.sbs.ind.in</p>

          <div className="flex items-center gap-2">
            {/* Home */}
            <Link
              to="/"
              onClick={handleHomeClick}
              title="Home"
              aria-label="Home"
              className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}
            >
              <Home size={18} />
            </Link>

            {/* Customer Support */}
            <Link
              to="/contact"
              title="Customer Support"
              aria-label="Customer Support"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${supportBtn}`}
            >
              <Headset size={18} strokeWidth={2} />
              <span className="hidden sm:inline">Support</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      {/* pt-16 = navbar height, pb-10 = ticker height */}
      <main className="flex-1 pt-16" style={{ paddingBottom: '40px' }}>
        <Outlet />
      </main>

      {/* ── STICKY FOOTER TICKER ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#006aff] flex items-center overflow-hidden border-t-2 " style={{ height: '40px' }}>
        <Link to="/contact"
          className="shrink-0 text-white font-bold text-xs bg-[#006aff] px-4 h-full flex items-center gap-1.5 hover:brightness-110 transition z-10 "
        >
          <Phone size={12} />
          Contact Us
        </Link>
        <div className="overflow-hidden flex-1 flex items-center">
          <div className="marquee-track ">
            {ticker.map((city, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[#ffffff] text-xs font-semibold px-4">
                <MapPin size={10} />
                {city}
                <span className="text-[#fbfbfb] ml-2">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}