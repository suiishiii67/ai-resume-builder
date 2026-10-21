// Pop-up dialog box.
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

function Modal({ title, onClose, children, footer, size = 'md' }) {
  const dialogRef = useRef(null)
  // Keep the latest onClose in a ref so the effect below runs only once
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  // On open: focus the dialog, close on Escape, stop the page behind from scrolling
  useEffect(() => {
    dialogRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [])

  const widthClass = { md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-deep/55 p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full ${widthClass} flex-col rounded-t-lg bg-paper shadow-pop sm:rounded-lg`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id="modal-title" className="text-lg font-bold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-9 place-items-center rounded text-ink-soft hover:bg-ink/5 hover:text-ink"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <footer className="flex justify-end gap-3 border-t border-line px-5 py-4">{footer}</footer>}
      </div>
    </div>
  )
}

export default Modal
