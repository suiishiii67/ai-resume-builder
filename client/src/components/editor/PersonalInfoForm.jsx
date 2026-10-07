// Editor form for name and contact details.
import { useState } from 'react'
import Input from '../Input'
import { validatePersonalInfo } from '../../utils/validation'

const PERSONAL_FIELDS = [
  { name: 'fullName', label: 'Full name', autoComplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', placeholder: '+91 98200 12345' },
  { name: 'location', label: 'City', placeholder: 'e.g. Mumbai, Maharashtra' },
  { name: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/your-name' },
  { name: 'portfolio', label: 'GitHub / portfolio', placeholder: 'github.com/your-name' },
]

function PersonalInfoForm({ value, onChange, showErrors = false }) {
  // Fields the user has left, so errors show after typing, not during
  const [touched, setTouched] = useState({})
  const errors = validatePersonalInfo(value)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {PERSONAL_FIELDS.map((field) => (
        <Input
          key={field.name}
          id={`personal-${field.name}`}
          label={field.label}
          type={field.type || 'text'}
          autoComplete={field.autoComplete}
          placeholder={field.placeholder}
          value={value[field.name] || ''}
          error={showErrors || touched[field.name] ? errors[field.name] : ''}
          onBlur={() => setTouched({ ...touched, [field.name]: true })}
          onChange={(event) => onChange({ ...value, [field.name]: event.target.value })}
        />
      ))}
    </div>
  )
}

export default PersonalInfoForm
