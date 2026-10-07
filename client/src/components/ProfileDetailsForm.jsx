// Profile page form for changing name and email.
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updateProfile } from '../services/authService'
import { validateProfileForm, hasErrors } from '../utils/validation'
import Input from './Input'
import Button from './Button'
import FormAlert from './FormAlert'

function ProfileDetailsForm() {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const [formValues, setFormValues] = useState({ name: user.name, email: user.email })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    const newValues = { ...formValues, [name]: value }
    setFormValues(newValues)
    // While typing, re-check only a field that already shows an error
    if (errors[name]) setErrors({ ...errors, [name]: validateProfileForm(newValues)[name] })
  }

  // Check a field when the user leaves it
  const handleBlur = (event) => setErrors({ ...errors, [event.target.name]: validateProfileForm(formValues)[event.target.name] })

  const handleSave = async (event) => {
    event.preventDefault()
    const validationErrors = validateProfileForm(formValues)
    setErrors(validationErrors)
    setFormError('')
    if (hasErrors(validationErrors)) return

    setIsSaving(true)
    try {
      const updatedUser = await updateProfile(user.id, formValues)
      updateUser(updatedUser)
      showToast('Profile updated.')
    } catch (error) {
      setFormError(error.message)
    }
    setIsSaving(false)
  }

  const isUnchanged = formValues.name === user.name && formValues.email === user.email

  return (
    <form noValidate onSubmit={handleSave} className="rounded-lg border border-line bg-paper p-5">
      <h2 className="mb-4 text-xl font-bold">Profile details</h2>
      <FormAlert message={formError} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input id="profile-name" name="name" label="Full name" autoComplete="name" value={formValues.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} required />
        <Input id="profile-email" name="email" type="email" label="Email" autoComplete="email" value={formValues.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} required />
      </div>
      <Button type="submit" className="mt-5" loading={isSaving} disabled={isUnchanged}>
        Save changes
      </Button>
    </form>
  )
}

export default ProfileDetailsForm
