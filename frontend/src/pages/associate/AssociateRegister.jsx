import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { CheckCircle2, BadgeCheck, Lock, Eye, EyeOff } from 'lucide-react'
import { associateApi } from '../../api'
import toast from 'react-hot-toast'

// Reachable only through an admin-generated link: /associate/register/<token>.
// The token is verified with the backend before the form is ever rendered.
// With no token, or an invalid / used / expired / revoked one, the visitor
// only sees "Please Contact Admin".
export default function AssociateRegister() {
  const { token } = useParams()
  const [linkState, setLinkState] = useState(token ? 'checking' : 'invalid') // checking | valid | invalid
  const [form, setForm] = useState({ clientId: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    let cancelled = false
    associateApi.get(`/associate/register/validate/${encodeURIComponent(token)}`)
      .then(() => { if (!cancelled) setLinkState('valid') })
      .catch(() => { if (!cancelled) setLinkState('invalid') })
    return () => { cancelled = true }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^[A-Za-z0-9._-]{4,30}$/.test(form.clientId.trim())) {
      return toast.error('Client ID must be 4-30 characters: letters, numbers, dot, dash or underscore')
    }
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')

    setLoading(true)
    try {
      const res = await associateApi.post('/associate/register', { ...form, token })
      setSuccess(res.data.clientId)
      toast.success('Registration successful!')
    } catch (err) {
      const status = err?.response?.status
      if (status === 403) setLinkState('invalid')
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const shell = (children) => (
    <div className="min-h-[80vh] bg-theme-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )

  if (success) {
    return shell(
      <div className="bg-theme-card border border-theme rounded-2xl p-6 text-center">
        <CheckCircle2 size={40} className="text-[#44DD88] mx-auto mb-3" />
        <h1 className="text-theme-primary font-bold text-lg mb-2">Registration Successful</h1>
        <p className="text-theme-secondary text-sm mb-1">Your Client ID:</p>
        <p className="text-[#FFD700] font-bold text-lg mb-3 break-all">{success}</p>
        <p className="text-theme-secondary text-sm mb-4">Use this Client ID and the password you just created to log in.</p>
        <button onClick={() => navigate('/associate/login')}
          className="w-full bg-[#FFD700] text-[#0A0A0A] font-bold py-3 rounded-xl hover:bg-[#E6C200] transition">
          Go to Login
        </button>
      </div>
    )
  }

  if (linkState === 'checking') {
    return shell(<p className="text-center text-theme-muted text-sm">Checking registration link…</p>)
  }

  if (linkState === 'invalid') {
    return shell(
      <div className="bg-theme-card border border-theme rounded-2xl p-8 text-center">
        <h1 className="text-theme-primary font-bold text-xl">Please Contact Admin</h1>
      </div>
    )
  }

  const inputClass = "w-full input-bg border border-theme rounded-xl pl-10 pr-4 py-3 text-theme-primary text-sm placeholder-theme-muted focus:border-[#FFD700]/60"
  const labelClass = "text-theme-secondary text-xs font-semibold uppercase tracking-wide mb-2 block"
  const iconClass = "absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted"

  return shell(
    <>
      <div className="bg-theme-card border border-theme rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Client ID</label>
            <div className="relative">
              <BadgeCheck size={15} className={iconClass} />
              <input type="text" placeholder="Choose a Client ID" value={form.clientId} maxLength={30}
                autoComplete="username"
                onChange={e => setForm(f => ({ ...f, clientId: e.target.value.replace(/\s/g, '') }))} className={inputClass} required />
            </div>
            <p className="text-theme-muted text-[11px] mt-1">4-30 characters. Letters, numbers, dot, dash, underscore. You'll use this to log in.</p>
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <Lock size={15} className={iconClass} />
              <input type={show ? 'text' : 'password'} placeholder="At least 8 characters" value={form.password}
                autoComplete="new-password"
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={inputClass + ' pr-10'} required />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-secondary transition">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#2563EB] text-[#f7f6f6] font-bold py-3.5 rounded-xl hover:bg-[#175aeb] transition mt-2 disabled:opacity-70">
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
      <p className="text-center mt-4 text-theme-secondary text-xs">
        Already registered? <Link to="/associate/login" className="text-[#2563EB] hover:underline">Sign in</Link>
      </p>
    </>
  )
}