// Wizard step 1: paste the job description, then the job title and company.
import Autocomplete from '../Autocomplete'
import JobDescriptionBox from '../JobDescriptionBox'
import CompanyInsight from './CompanyInsight'
import { guessJobTitle } from '../../utils/jobDescription'

function StepTarget({ target, onTargetChange, companies, roles, errors, company, role, templateName }) {
  const companyOptions = companies.map((item) => ({ id: item.id, label: item.name, meta: item.type }))
  const roleOptions = roles.map((item) => ({ id: item.id, label: item.title, meta: item.category }))
  // Only show the company profile when a company from our list is picked
  const showInsight = target.companyId && target.roleTitle.trim()

  // Fill the job title from the first line of the job description, if it is still empty
  const handleJobDescriptionChange = (jobDescription) => {
    const roleTitle = target.roleTitle.trim() ? target.roleTitle : guessJobTitle(jobDescription)
    onTargetChange({ ...target, jobDescription, roleTitle, roleId: roleTitle === target.roleTitle ? target.roleId : '' })
  }

  return (
    <div className="space-y-6">
      <JobDescriptionBox
        id="target-job-description"
        value={target.jobDescription}
        onChange={handleJobDescriptionChange}
        error={errors.jobDescription}
        hint="Recommended. The skills it asks for are used for your summary, keywords and ATS score."
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Autocomplete
          id="target-role"
          label="Job title"
          required
          value={target.roleTitle}
          options={roleOptions}
          placeholder="e.g. Frontend Developer"
          hint="Type the job title from the post, or pick one."
          error={errors.roleTitle}
          onTextChange={(text) => onTargetChange({ ...target, roleTitle: text, roleId: '' })}
          onSelect={(option) => onTargetChange({ ...target, roleTitle: option.label, roleId: option.id })}
        />
        <Autocomplete
          id="target-company"
          label="Company (optional)"
          value={target.companyName}
          options={companyOptions}
          placeholder="e.g. Infosys"
          hint="Type any company, or pick one from the list."
          // Typing clears the id, so the text can be any company
          onTextChange={(text) => onTargetChange({ ...target, companyName: text, companyId: '' })}
          onSelect={(option) => onTargetChange({ ...target, companyName: option.label, companyId: option.id })}
        />
      </div>

      {showInsight && <CompanyInsight company={company} role={role} templateName={templateName} />}
    </div>
  )
}

export default StepTarget
