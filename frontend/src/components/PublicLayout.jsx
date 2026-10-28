import React from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Headset, Home } from 'lucide-react'
import { associateLogout } from '../api'

const NAVY_BLUE = '#2563EB'

// Official YouTube logo mark (red rounded rectangle + white play button)
const YouTubeIcon = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#FF0000"
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
    />
    <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12z" />
  </svg>
)

export default function PublicLayout() {
  const navigate = useNavigate()

  // If an associate is signed in, clicking Home should securely end that
  // session before returning to the public site — not just navigate away
  // while the session is still live.
  const handleHomeClick = async (e) => {
    const associateToken = localStorage.getItem('sbs_associate_token')
    if (!associateToken) return
    e.preventDefault()
    await associateLogout(navigate)
  }

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
      {/* pt-16 = navbar height */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#2563EB] text-white t  ext-sm font-semibold px-3 py-3 flex items-center justify-center gap-2">
        <YouTubeIcon size={24} />
        <span>@sbsEdu-News</span>
      </footer>
    </div>
  )
}