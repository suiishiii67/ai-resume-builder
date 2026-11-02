// Wizard step 2: choose a template.
import TemplateCard from '../TemplateCard'

function StepTemplate({ templates, selectedTemplateId, onSelect, recommendedId, previewResume }) {
  // The recommended template first
  const sortedTemplates = [...templates].sort((first, second) => (second.id === recommendedId) - (first.id === recommendedId))

  return (
    <div>
      <p className="mb-4 text-[15px] text-ink-soft">
        We recommend a template from your job title and experience: Tech for tech roles, Professional if you have
        full-time work experience, Campus Placement for freshers. Pick any one; you can change it later in the editor
        without losing any content.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-5">
        {sortedTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            sampleResume={previewResume}
            isRecommended={template.id === recommendedId}
            isSelected={template.id === selectedTemplateId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

export default StepTemplate
