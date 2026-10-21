// Footer for the public pages.
import { Link } from 'react-router-dom'
import Logo from './Logo'

function Footer() {
  return (
    <footer className="on-navy bg-navy-deep text-navy-ink">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed">
            Build ATS-friendly resumes tailored to the company and job role you are applying for.
          </p>
        </div>

        <div>
          <h2 className="board-text text-sm text-white">Product</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li><Link to="/templates" className="hover:text-white hover:underline">Templates</Link></li>
            <li><Link to="/signup" className="hover:text-white hover:underline">Create a resume</Link></li>
            <li><Link to="/ats-checker" className="hover:text-white hover:underline">ATS checker</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="board-text text-sm text-white">Account</h2>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li><Link to="/login" className="hover:text-white hover:underline">Log in</Link></li>
            <li><Link to="/signup" className="hover:text-white hover:underline">Sign up</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm sm:px-6">
          © 2026 AI Resume Builder · MERN stack college project.
        </p>
      </div>
    </footer>
  )
}

export default Footer
