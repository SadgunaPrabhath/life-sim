import React from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  dismissable?: boolean
}

export function Modal({ open, onClose, children, size = 'md', dismissable = true }: Props) {
  if (!open) return null
  const width = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={dismissable ? onClose : undefined}
      />
      <div className={`relative w-full ${width} glass-strong rounded-3xl shadow-glow animate-scale-in max-h-[90vh] overflow-y-auto`}>
        {dismissable && onClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={18} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}
