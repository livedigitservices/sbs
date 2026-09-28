import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Phone, CheckCircle2 } from 'lucide-react'
import { associateApi } from '../../api'
import toast from 'react-hot-toast'

export default function AssociateRegister() {
  const [form, setForm] = useState({ name: '', mobile: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      toast.error('Enter a valid 10-digit mobile number')
      return
    }
    setLoading(true)
    try {
      const res = await associateApi.post('/associate/register', form)
      setSuccess(res.data.associateId)
      toast.success('Registration successful!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-theme-card border border-theme rounded-2xl p-6">
            <CheckCircle2 size={40} className="text-[#44DD88] mx-auto mb-3" />
            <h1 className="text-theme-primary font-bold text-lg mb-2">Registration Successful</h1>
            <p className="text-theme-secondary text-sm mb-1">Your Associate ID is your mobile number:</p>
            <p className="text-[#FFD700] font-bold text-lg mb-3">{success}</p>
            <p className="text-theme-secondary text-sm mb-4">
              Your default password is also your mobile number. Please log in and change your password immediately after your first login.
            </p>
            <button onClick={() => navigate('/associate/login')}
              className="w-full bg-[#FFD700] text-[#0A0A0A] font-bold py-3 rounded-xl hover:bg-[#E6C200] transition">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] bg-theme-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block hover:opacity-80 transition">
          </Link>
          <h1 className="text-theme-primary font-bold text-xl">Associate Registration</h1>
          <p className="text-theme-secondary text-sm mt-1">Join the SBS Associate Portal</p>
        </div>

        <div className="bg-theme-card border border-theme rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-theme-secondary text-xs font-semibold uppercase tracking-wide mb-2 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
                <input type="text" placeholder="Your full name" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full input-bg border border-theme rounded-xl pl-10 pr-4 py-3 text-theme-primary text-sm placeholder-theme-muted focus:border-[#FFD700]/60" required />
              </div>
            </div>
            <div>
              <label className="text-theme-secondary text-xs font-semibold uppercase tracking-wide mb-2 block">Mobile Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
                <input type="tel" placeholder="10-digit mobile number" value={form.mobile} maxLength={10}
                  onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '') }))}
                  className="w-full input-bg border border-theme rounded-xl pl-10 pr-4 py-3 text-theme-primary text-sm placeholder-theme-muted focus:border-[#FFD700]/60" required />
              </div>
            </div>
            <p className="text-theme-muted text-xs">
              Your Associate ID and default password will both be your mobile number. You'll be asked to change your password on first login.
            </p>
            <button type="submit" disabled={loading}
              className="w-full bg-[#2563EB] text-[#f7f6f6] font-bold py-3.5 rounded-xl hover:bg-[#175aeb] transition mt-2 disabled:opacity-70">
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
        <p className="text-center mt-4 text-theme-secondary text-xs">
          Already registered? <Link to="/associate/login" className="text-[#2563EB] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}