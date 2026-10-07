// Profile page form for changing the password.
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { changePassword } from '../services/authService'
import { validatePasswordChange, hasErrors, PASSWORD_HINT } from '../utils/validation'
import PasswordInput from './PasswordInput'
import Button from './Button'
import FormAlert from './FormAlert'

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' }

function ChangePasswordForm() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    const newValues = { ...formValues, [name]: value }
    setFormValues(newValues)
    // While typing, re-check only a field that already shows an error
    if (errors[name]) setErrors({ ...errors, [name]: validatePasswordChange(newValues)[name] })
  }

  // Check a field when the user leaves it
  const handleBlur = (event) => setErrors({ ...errors, [event.target.name]: validatePasswordChange(formValues)[event.target.name] })

  const handleChangePassword = async (event) => {
    event.preventDefault()
    const validationErrors = validatePasswordChange(formValues)
    setErrors(validationErrors)
    setFormError('')
    if (hasErrors(validationErrors)) return

    setIsSaving(true)
    try {
      await changePassword(user.id, formValues.currentPassword, formValues.newPassword)
      setFormValues(EMPTY_FORM)
      showToast('Password changed.')
    } catch (error) {
      setFormError(error.message)
    }
    setIsSaving(false)
  }

  return (
    <form noValidate onSubmit={handleChangePassword} className="rounded-lg border border-line bg-paper p-5">
      <h2 className="mb-4 text-xl font-bold">Change password</h2>
      <FormAlert message={formError} />
      <div className="grid gap-4 sm:grid-cols-2">
        <PasswordInput id="current-password" name="currentPassword" label="Current password" autoComplete="current-password" value={formValues.currentPassword} onChange={handleChange} onBlur={handleBlur} error={errors.currentPassword} className="sm:col-span-2" required />
        <PasswordInput id="new-password" name="newPassword" label="New password" autoComplete="new-password" hint={PASSWORD_HINT} value={formValues.newPassword} onChange={handleChange} onBlur={handleBlur} error={errors.newPassword} required />
        <PasswordInput id="confirm-new-password" name="confirmPassword" label="Confirm new password" autoComplete="new-password" value={formValues.confirmPassword} onChange={handleChange} onBlur={handleBlur} error={errors.confirmPassword} required />
      </div>
      <Button type="submit" className="mt-5" loading={isSaving}>
        Change password
      </Button>
    </form>
  )
}

export default ChangePasswordForm
