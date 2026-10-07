// All the section forms in the editor, in the resume's section order.
import { SECTION_LABELS } from '../../data/sections'
import EditorSection from './EditorSection'
import PersonalInfoForm from './PersonalInfoForm'
import SummaryForm from './SummaryForm'
import SkillsForm from './SkillsForm'
import ExperienceForm from './ExperienceForm'
import EducationForm from './EducationForm'
import ProjectsForm from './ProjectsForm'
import CertificationsForm from './CertificationsForm'

const SECTION_FORMS = {
  summary: SummaryForm,
  skills: SkillsForm,
  experience: ExperienceForm,
  education: EducationForm,
  projects: ProjectsForm,
  certifications: CertificationsForm,
}

// Sections the AI can improve
const AI_SECTIONS = ['summary', 'skills', 'experience', 'projects']

function EditorSections({ resumeData, onSectionChange, onMoveSection, onImprove, improvingSection, openSections, onToggleSection, showErrors }) {
  const { sectionOrder } = resumeData

  return (
    <div className="space-y-3">
      <EditorSection sectionKey="personal" title="Personal info" isOpen={openSections.includes('personal')} onToggle={() => onToggleSection('personal')}>
        <PersonalInfoForm value={resumeData.personal} onChange={(value) => onSectionChange('personal', value)} showErrors={showErrors} />
      </EditorSection>

      {sectionOrder.map((sectionKey, index) => {
        const SectionForm = SECTION_FORMS[sectionKey]
        const value = resumeData[sectionKey]
        return (
          <EditorSection
            key={sectionKey}
            sectionKey={sectionKey}
            title={SECTION_LABELS[sectionKey]}
            count={Array.isArray(value) ? value.length : undefined}
            isOpen={openSections.includes(sectionKey)}
            onToggle={() => onToggleSection(sectionKey)}
            onMoveUp={index > 0 ? () => onMoveSection(index, -1) : undefined}
            onMoveDown={index < sectionOrder.length - 1 ? () => onMoveSection(index, 1) : undefined}
            onImprove={AI_SECTIONS.includes(sectionKey) ? () => onImprove(sectionKey) : undefined}
            isImproving={improvingSection === sectionKey}
          >
            <SectionForm value={value} onChange={(newValue) => onSectionChange(sectionKey, newValue)} showErrors={showErrors} />
          </EditorSection>
        )
      })}
    </div>
  )
}

export default EditorSections
