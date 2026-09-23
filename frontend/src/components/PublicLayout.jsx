import React, { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Phone, MapPin, Headset, Sun, Moon, Home } from 'lucide-react'
import api, { associateLogout } from '../api'
import logo from '../assets/logo-sbs.jpeg'


function useTheme() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('sbs_theme')
    if (saved) return saved === 'dark'
    return true
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
    localStorage.setItem('sbs_theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark]
}

export default function PublicLayout() {
  const [cities, setCities] = useState(['Vizag','Eluru','Khammam','Hyderabad','Vijayawada','Guntur','Warangal'])
  const [dark, setDark] = useTheme()
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

  const navBg     = dark ? 'bg-[#0A0A0A]/95' : 'bg-[#F8F7F2]/96'
  const navBorder = dark ? 'border-[#FFD700]/20' : 'border-[#E6C200]/30'
  const logoText  = dark ? 'text-white' : 'text-[#111]'
  const logoSub   = dark ? 'text-[#FFD700]' : 'text-[#B8860B]'
  const mainBg    = dark ? 'bg-[#0A0A0A]' : 'bg-[#F8F7F2]'
  const supportBtn = dark
    ? 'bg-[#FFD700] text-[#0A0A0A] hover:bg-[#FFE44D]'
    : 'bg-[#013383] text-white hover:bg-[#01245e]'
  const iconBtn = dark
    ? 'text-[#FFD700] hover:bg-white/10'
    : 'text-[#B8860B] hover:bg-black/8'

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${mainBg}`}
      style={{ paddingTop: 0, paddingBottom: 0 }}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${navBg} backdrop-blur border-b ${navBorder} transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div>
              <img className="w-20 h-full" src={logo} alt="" />
            </div>
            <div className="hidden sm:block">
              <p className={`font-semibold text-sm md:text-xs leading-none ${logoText}`}>Sai Business Services</p>
              <p className={`text-[10px] mt-0.5 ${logoSub}`}>We Find Your Way</p>
            </div>
          </Link>

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

            {/* Theme toggle */}
            <button
              onClick={() => setDark(d => !d)}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
              className={`p-2 rounded-lg transition-all duration-200 ${iconBtn}`}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFD700] flex items-center overflow-hidden border-t-2 border-[#E6C200]" style={{ height: '40px' }}>
        <Link to="/contact"
          className="shrink-0 bg-[#013383] text-[#FFD700] font-bold text-xs px-4 h-full flex items-center gap-1.5 hover:bg-[#1A1A1A] transition z-10 "
        >
          <Phone size={12} />
          Contact Us
        </Link>
        <div className="overflow-hidden flex-1 flex items-center">
          <div className="marquee-track ">
            {ticker.map((city, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[#0A0A0A] text-xs font-semibold px-4">
                <MapPin size={10} />
                {city}
                <span className="text-[#0A0A0A]/40 ml-2">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}