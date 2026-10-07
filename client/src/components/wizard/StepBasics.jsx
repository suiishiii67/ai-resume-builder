// Wizard step 3: basic details form.
import Input from '../Input'
import Select from '../Select'

const EXPERIENCE_OPTIONS = [
  { value: 'fresher', label: 'Fresher (no internship yet)' },
  { value: 'internship', label: 'Internship experience' },
  { value: 'experienced', label: '1–2 years of work experience' },
]

function StepBasics({ basics, onChange, onBlur, errors }) {
  const field = (name, label, extra = {}) => (
    <Input id={`basics-${name}`} name={name} label={label} value={basics[name]} onChange={onChange} onBlur={onBlur} error={errors[name]} {...extra} />
  )

  return (
    <div className="space-y-6">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-bold">Contact details</legend>
        {field('fullName', 'Full name', { required: true, autoComplete: 'name' })}
        {field('email', 'Email', { required: true, type: 'email', autoComplete: 'email' })}
        {field('phone', 'Phone', { required: true, type: 'tel', autoComplete: 'tel', placeholder: '+91 98200 12345', hint: '10-digit mobile number.' })}
        {field('location', 'City', { placeholder: 'e.g. Pune, Maharashtra' })}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-bold">Education</legend>
        {field('degree', 'Degree', { required: true, placeholder: 'e.g. B.E. in Computer Engineering' })}
        {field('institution', 'College / university', { required: true })}
        {field('graduationYear', 'Graduation year', { required: true, inputMode: 'numeric', maxLength: 4, placeholder: '2027' })}
        {field('score', 'CGPA or percentage', { placeholder: 'e.g. CGPA 8.4 / 10 or 78%' })}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-bold">Experience</legend>
        <Select id="basics-experienceLevel" name="experienceLevel" label="Experience level" value={basics.experienceLevel} onChange={onChange} options={EXPERIENCE_OPTIONS} />
        {basics.experienceLevel !== 'fresher' && field('lastCompany', 'Company / internship name', { placeholder: 'Optional', maxLength: 80 })}
      </fieldset>
    </div>
  )
}

export default StepBasics
