import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [form, setForm] = useState({ email:'', password:'' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await api.post('/admin/login', form)
      localStorage.setItem('sbs_token', res.data.token)
      localStorage.setItem('sbs_email', res.data.email)
      toast.success('Welcome back!')
      navigate('/admin')
    } catch { toast.error('Invalid credentials') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-theme-card border border-theme rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-theme-secondary text-xs font-semibold uppercase tracking-wide mb-2 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
                <input type="email" placeholder="admin@sbs.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full input-bg border border-theme rounded-xl pl-10 pr-4 py-3 text-theme-primary text-sm placeholder-theme-muted focus:border-[#FFD700]/60" required />
              </div>
            </div>
            <div>
              <label className="text-theme-secondary text-xs font-semibold uppercase tracking-wide mb-2 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
                <input type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full input-bg border border-theme rounded-xl pl-10 pr-10 py-3 text-theme-primary text-sm placeholder-theme-muted focus:border-[#FFD700]/60" required />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#2563EB] text-[#f4f3f3] font-bold py-3.5 rounded-xl hover:bg-[#2056ca] transition mt-2 disabled:opacity-70">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        {/* <p className="text-center text-theme-muted text-xs mt-6">Default: admin@sbs.com / sbs@admin123</p> */}
        <p className="text-center mt-4">
          <Link to="/" className="text-theme-secondary text-xs hover:text-[#FFD700] transition">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  )
}
