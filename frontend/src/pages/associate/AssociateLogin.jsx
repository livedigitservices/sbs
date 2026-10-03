import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { associateApi } from '../../api'
import toast from 'react-hot-toast'

export default function AssociateLogin() {
  const [form, setForm] = useState({ associateId: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const res = await associateApi.post('/associate/login', form)
      localStorage.setItem('sbs_associate_token', res.data.token)
      localStorage.setItem('sbs_associate', JSON.stringify(res.data.associate))
      toast.success(`Welcome back, ${res.data.associate.name}!`)
      navigate('/associate/tutors', { replace: true })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div
      className="page-enter bg-theme-primary flex items-center justify-center p-4"
      style={{ minHeight: 'calc(100vh - 64px - 40px)' }}
    >
      <div className="w-full max-w-sm">
        <div className="bg-theme-card border border-theme rounded-2xl p-6 sm:p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-theme-secondary text-xs font-semibold uppercase tracking-wide mb-2 block">
                Associate ID 
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
                <input
                  type="text"
                  placeholder="Enter your ID"
                  value={form.associateId}
                  onChange={e => setForm(f => ({ ...f, associateId: e.target.value }))}
                  className="w-full input-bg border border-theme rounded-xl pl-10 pr-4 py-3 text-theme-primary text-sm placeholder-theme-muted focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-theme-secondary text-xs font-semibold uppercase tracking-wide mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full input-bg border border-theme rounded-xl pl-10 pr-10 py-3 text-theme-primary text-sm placeholder-theme-muted focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary transition"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-[#faf7f7] font-bold py-3.5 rounded-xl hover:bg-[#195ae6] transition mt-2 disabled:opacity-70"
            >
              {loading ? 'Signing in…' : (<>Sign In <ArrowRight size={16} /></>)}
            </button>

            <p className="text-center text-[11px] text-theme-muted pt-1">
              Use your registered ID and password.
            </p>
          </form>
        </div>

        <p className="text-center mt-5 text-theme-secondary text-xs">
          New associate? <Link to="/associate/register" className="text-[#2563EB] font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  )
}