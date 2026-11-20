import React from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={`flex items-center gap-2 bg-theme-card border border-theme rounded-2xl p-1.5 shadow-sm transition-shadow focus-within:shadow-[0_8px_24px_rgba(37,99,235,0.12)] ${className}`}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2.5 pl-3">
        <Search size={18} className="shrink-0 text-theme-muted" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full min-w-0 bg-transparent py-2 text-sm text-theme-primary placeholder:text-theme-muted"
          style={{ boxShadow: 'none' }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-theme-muted hover:bg-black/5 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="shrink-0 px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent-hover transition-colors"
      >
        Search
      </button>
    </form>
  )
}