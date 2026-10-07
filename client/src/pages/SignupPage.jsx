// Signup page (/signup).
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { validateSignupForm, hasErrors, PASSWORD_HINT } from '../utils/validation'
import Input from '../components/Input'
import PasswordInput from '../components/PasswordInput'
import Button from '../components/Button'
import FormAlert from '../components/FormAlert'
import AuthAside from '../components/AuthAside'

function SignupPage() {
  const { signup } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [formValues, setFormValues] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues({ ...formValues, [name]: value })
    setErrors({ ...errors, [name]: '' })
  }

  const handleSignup = async (event) => {
    event.preventDefault()
    const validationErrors = validateSignupForm(formValues)
    setErrors(validationErrors)
    setFormError('')
    if (hasErrors(validationErrors)) return

    setIsSubmitting(true)
    try {
      await signup(formValues)
      showToast('Account created. Start with your target company and role.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-4rem)] lg:grid-cols-[1fr_minmax(0,520px)]">
      <section className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-board text-4xl font-bold">Create your account</h1>
          <p className="mt-1.5 mb-7 text-[15px] text-ink-soft">Save as many tailored resumes as you need.</p>

          <FormAlert message={formError} />

          <form noValidate onSubmit={handleSignup} className="space-y-4">
            <Input id="name" name="name" label="Full name" autoComplete="name" value={formValues.name} onChange={handleChange} error={errors.name} required />
            <Input id="email" name="email" type="email" label="Email" autoComplete="email" value={formValues.email} onChange={handleChange} error={errors.email} required />
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              autoComplete="new-password"
              hint={PASSWORD_HINT}
              value={formValues.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm password"
              autoComplete="new-password"
              value={formValues.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
            <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-[15px] text-ink-soft">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-navy underline">
              Log in
            </Link>
          </p>
        </div>
      </section>
      <AuthAside />
    </div>
  )
}

export default SignupPage
