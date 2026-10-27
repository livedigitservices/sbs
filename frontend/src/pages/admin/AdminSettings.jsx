import React, { useState, useEffect } from 'react'
import { Save, Plus, Globe, Image, Upload, Trash2 } from 'lucide-react'
import api from '../../api'
import toast from 'react-hot-toast'

const inputCls = "w-full input-bg border border-theme rounded-xl px-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#2563EB]/60"

const LOGO_SECTIONS = [
  { key: 'jobLogos',      label: 'Hiring Partners',     desc: 'Company logos shown on the Jobs page.',               accent: '#16A34A' },
  { key: 'businessLogos', label: 'Business Partners',   desc: 'Business logos shown on the Business Offers page.',   accent: '#2563EB' },
  { key: 'degreeLogos',   label: 'University Partners', desc: 'College logos shown on the Degrees page.',            accent: '#7C3AED' },
]

function LogoSection({ logoKey, label, desc, accent, initialLogos }) {
  const [logos, setLogos]     = useState(initialLogos || [])
  const [newName, setNewName] = useState('')
  const [newFile, setNewFile] = useState(null)
  const [adding, setAdding]   = useState(false)

  useEffect(() => { setLogos(initialLogos || []) }, [initialLogos])

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error('Enter a name')
    setAdding(true)
    try {
      const fd = new FormData()
      fd.append('name', newName.trim())
      if (newFile) fd.append('logo', newFile)
      const res = await api.post(`/settings/partner-logos?section=${logoKey}`, fd)
      setLogos(res.data.logos)
      setNewName('')
      setNewFile(null)
      toast.success('Logo added')
    } catch { toast.error('Failed to add') }
    finally { setAdding(false) }
  }

  const handleRemove = async (idx) => {
    if (!confirm('Remove this logo?')) return
    try {
      const res = await api.delete(`/settings/partner-logos/${idx}?section=${logoKey}`)
      setLogos(res.data.logos)
      toast.success('Removed')
    } catch { toast.error('Failed to remove') }
  }

  return (
    <div className="bg-theme-card border border-theme rounded-2xl p-5">
      <h3 className="text-theme-primary font-bold mb-1 flex items-center gap-2">
        <Image size={15} style={{ color: accent }} /> {label}
      </h3>
      <p className="text-theme-muted text-xs mb-5">{desc}</p>

      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          type="text" value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="Name..."
          className="flex-1 input-bg border border-theme rounded-xl px-4 py-2.5 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#2563EB]/60"
        />
        <label className="flex items-center gap-2 px-4 py-2.5 input-bg border border-dashed border-theme rounded-xl cursor-pointer hover:border-[#2563EB]/40 transition text-sm text-theme-secondary whitespace-nowrap">
          <Upload size={14} className="text-theme-muted flex-shrink-0" />
          <span className="truncate max-w-[120px]">{newFile ? newFile.name : 'Upload logo'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => setNewFile(e.target.files[0])} />
        </label>
        <button onClick={handleAdd} disabled={adding}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-[#1D4ED8] transition text-sm disabled:opacity-60 whitespace-nowrap">
          <Plus size={15} /> {adding ? 'Adding…' : 'Add'}
        </button>
      </div>

      {!logos.length ? (
        <p className="text-theme-muted text-sm">No logos yet. Add one above.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {logos.map((p, idx) => (
            <div key={idx}
              className="flex items-center gap-2.5 bg-theme-secondary border border-theme rounded-xl px-3 py-2.5">
              {p.logo ? (
                <img src={p.logo} alt={p.name}
                  className="w-8 h-8 object-contain rounded bg-white p-0.5 flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: `${accent}18`, color: accent }}>
                  {p.name[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-theme-primary text-xs font-medium truncate flex-1">{p.name}</span>
              <button onClick={() => handleRemove(idx)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-500 transition flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminSettings() {
  const [siteUrl, setSiteUrl]   = useState('')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [logoData, setLogoData] = useState({})

  useEffect(() => {
    api.get('/settings').then(r => {
      setSiteUrl(r.data.siteUrl || '')
      const all = r.data.partnerLogos || {}
      const ld = {}
      LOGO_SECTIONS.forEach(s => { ld[s.key] = Array.isArray(all[s.key]) ? all[s.key] : [] })
      setLogoData(ld)
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/settings', { siteUrl })
      toast.success('Settings saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="text-center py-20 text-theme-muted">Loading...</div>

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-theme-primary font-black text-2xl">Settings</h1>
        <p className="text-theme-secondary text-sm mt-0.5">Configure site-wide settings</p>
      </div>

      <div className="space-y-5">

        <div className="bg-theme-card border border-theme rounded-2xl p-5">
          <h3 className="text-theme-primary font-bold mb-1 flex items-center gap-2">
            <Globe size={15} className="text-[#2563EB]" /> Site URL
          </h3>
          <p className="text-theme-muted text-xs mb-4">Used for QR code generation. Set your live domain here.</p>
          <input type="url" value={siteUrl} onChange={e => setSiteUrl(e.target.value)}
            placeholder="https://yourdomain.com" className={inputCls} />
        </div>

        {LOGO_SECTIONS.map(({ key, ...rest }) => (
          <LogoSection key={key} logoKey={key} {...rest} initialLogos={logoData[key]} />
        ))}

        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-[#2563EB] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-[#1D4ED8] transition text-sm disabled:opacity-70">
          <Save size={16} /> {saving ? 'Saving...' : 'Save All Settings'}
        </button>

      </div>
    </div>
  )
}