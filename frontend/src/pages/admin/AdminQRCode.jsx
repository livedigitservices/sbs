import React, { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { QrCode, Download, Printer, Link, RefreshCw, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const QUICK_URLS = [
  { label: 'Home Page', path: '/' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Online Degrees', path: '/online-degrees' },
  { label: 'Business Offers', path: '/business-offers' },
  { label: 'Contact Us', path: '/contact' },
]

const SIZES = [
  { label: 'Small', value: 180 },
  { label: 'Medium', value: 256 },
  { label: 'Large', value: 340 },
  { label: 'Print (500px)', value: 500 },
]

export default function AdminQRCode() {
  const baseUrl = window.location.origin
  const [url, setUrl] = useState(baseUrl)
  const [size, setSize] = useState(256)
  const [generated, setGenerated] = useState(true)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef(null)

  const handleQuickUrl = (path) => {
    setUrl(baseUrl + path)
    setGenerated(true)
  }

  const handleGenerate = () => {
    if (!url.trim()) return toast.error('Enter a URL')
    setGenerated(true)
    toast.success('QR Code generated!')
  }

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'sbs-qrcode.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast.success('QR Code downloaded!')
  }

  const handlePrint = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const img = canvas.toDataURL('image/png')
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>SBS QR Code</title>
      <style>
        body { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; margin:0; font-family:sans-serif; background:#fff; }
        img { width:300px; height:300px; }
        h2 { color:#000; font-size:18px; margin-top:16px; }
        p { color:#555; font-size:12px; margin:4px 0; }
      </style></head>
      <body>
        <img src="${img}" />
        <h2>SBS — Sai Business Solutions</h2>
        <p>Scan to visit: ${url}</p>
        <p style="margin-top:20px;font-size:10px;color:#aaa;">We Find Your Way</p>
      </body></html>`)
    win.document.close()
    win.print()
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('URL copied!')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-theme-primary font-black text-2xl">QR Code Generator</h1>
        <p className="text-theme-secondary text-sm mt-0.5">Generate QR codes for your website — users scan to visit instantly</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Config */}
        <div className="space-y-5">

          {/* Quick URL buttons */}
          <div className="bg-theme-card border border-theme rounded-2xl p-5">
            <h3 className="text-theme-primary font-bold text-sm mb-3">Quick Select Page</h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_URLS.map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => handleQuickUrl(path)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border
                    ${url === baseUrl + path
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'input-bg text-theme-secondary border-theme hover:border-[#2563EB]/40 hover:text-theme-primary'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom URL */}
          <div className="bg-theme-card border border-theme rounded-2xl p-5">
            <h3 className="text-theme-primary font-bold text-sm mb-3">Custom URL</h3>
            <div className="relative">
              <Link size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="url"
                value={url}
                onChange={e => { setUrl(e.target.value); setGenerated(false) }}
                placeholder="https://yourdomain.com"
                className="w-full input-bg border border-theme rounded-xl pl-10 pr-4 py-3 text-theme-primary text-sm placeholder-[var(--text-muted)] focus:border-[#2563EB]/60"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={handleCopyUrl}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-theme-tertiary text-theme-secondary hover:text-theme-primary text-xs font-medium transition">
                {copied
                  ? <><CheckCircle size={12} className="text-[#16A34A]" /> Copied</>
                  : <><Link size={12} /> Copy URL</>}
              </button>
              <button onClick={handleGenerate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 text-xs font-semibold transition">
                <RefreshCw size={12} /> Generate
              </button>
            </div>
          </div>

          {/* Size selector */}
          <div className="bg-theme-card border border-theme rounded-2xl p-5">
            <h3 className="text-theme-primary font-bold text-sm mb-3">QR Code Size</h3>
            <div className="grid grid-cols-4 gap-2">
              {SIZES.map(({ label, value }) => (
                <button key={value} onClick={() => setSize(value)}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition border
                    ${size === value
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'input-bg text-theme-secondary border-theme hover:border-theme-gold'
                    }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleDownload}
              className="flex items-center justify-center gap-2 bg-[#2563EB] text-white font-bold py-3.5 rounded-xl hover:bg-[#1D4ED8] transition text-sm">
              <Download size={16} /> Download PNG
            </button>
            <button onClick={handlePrint}
              className="flex items-center justify-center gap-2 border border-theme text-theme-primary font-semibold py-3.5 rounded-xl hover:border-theme-gold hover:bg-theme-tertiary transition text-sm">
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Right: QR Preview */}
        <div className="bg-theme-card border border-theme rounded-2xl p-6 flex flex-col items-center justify-center gap-5">
          <div className="text-center mb-2">
            <p className="text-theme-muted text-xs uppercase tracking-widest font-semibold">Preview</p>
          </div>

          {generated ? (
            <>
              <div ref={qrRef}
                className="bg-white p-5 rounded-2xl shadow-2xl shadow-[#2563EB]/10"
                style={{ border: '3px solid #2563EB' }}>
                <QRCodeCanvas
                  value={url || 'https://sbsindia.com'}
                  size={Math.min(size, 260)}
                  level="H"
                  includeMargin={false}
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
              </div>

              {/* SBS Branding */}
              <div className="text-center">
                <div className="bg-[#2563EB] text-white font-black text-lg px-4 py-1.5 rounded-lg inline-block mb-2">SBS</div>
                <p className="text-theme-primary font-bold text-sm">Sai Business Services</p>
                <p className="text-theme-muted text-xs mt-0.5">We Find Your Way</p>
                <p className="text-theme-muted text-xs mt-3 max-w-[200px] break-all">{url}</p>
              </div>

              <div className="w-full input-bg border border-theme rounded-xl p-3 text-center">
                <p className="text-theme-muted text-xs">
                  Share this QR code on flyers, banners, or social media.
                  Anyone who scans it will land directly on your website.
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center">
                <QrCode size={36} className="text-[#2563EB]/50" />
              </div>
              <p className="text-theme-secondary text-sm">Enter a URL and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}