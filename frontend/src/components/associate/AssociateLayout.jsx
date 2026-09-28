import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

// Renders inside the shared PublicLayout (navbar + contact ticker already
// provided there). Thin wrapper: a two-tab switcher so associates can move
// between managing Tutors and managing Leads, then the protected page.
const TABS = [
  { to: '/associate/tutors', label: 'Tutors' },
  { to: '/associate/leads', label: 'Leads' },
]

export default function AssociateLayout() {
  return (
    <div
      className="page-enter bg-theme-primary max-w-6xl w-full mx-auto px-4 py-6 md:py-8"
      style={{ minHeight: 'calc(100vh - 64px - 40px)' }}
    >
      <nav className="flex gap-2 mb-6 border-b border-theme">
        {TABS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-5 py-2.5 text-sm font-bold -mb-px border-b-2 transition ${
                isActive
                  ? 'border-[#FFD700] text-theme-primary'
                  : 'border-transparent text-theme-muted hover:text-theme-primary'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}