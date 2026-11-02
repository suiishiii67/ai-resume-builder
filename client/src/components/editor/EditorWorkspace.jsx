// Editor layout: forms on the left, live preview on the right (tabs on phones).
import { useState } from 'react'
import ResumePreview from '../templates/ResumePreview'
import KeywordPanel from './KeywordPanel'
import AtsScoreBox from './AtsScoreBox'
import EditorSections from './EditorSections'

function EditorWorkspace({ resumeData, design, company, role, printRef, onAddSkill, onCheckAts, sectionProps }) {
  const [activeTab, setActiveTab] = useState('edit')
  const tabClasses = (tab) => `h-10 flex-1 rounded-md text-[15px] font-semibold ${activeTab === tab ? 'bg-navy text-white' : 'text-ink-soft'}`

  return (
    <>
      <div role="tablist" aria-label="Editor view" className="flex gap-1 rounded-lg border border-line bg-paper p-1 lg:hidden">
        <button type="button" role="tab" aria-selected={activeTab === 'edit'} className={tabClasses('edit')} onClick={() => setActiveTab('edit')}>Edit</button>
        <button type="button" role="tab" aria-selected={activeTab === 'preview'} className={tabClasses('preview')} onClick={() => setActiveTab('preview')}>Preview</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={`${activeTab === 'edit' ? 'block' : 'hidden'} min-w-0 space-y-3 lg:block`}>
          <AtsScoreBox resumeData={resumeData} onOpenReport={onCheckAts} />
          <KeywordPanel company={company} role={role} resumeData={resumeData} onAddSkill={onAddSkill} />
          <EditorSections resumeData={resumeData} {...sectionProps} />
        </div>

        {/* Live preview: gets resumeData as a prop, so it updates on every keystroke */}
        <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} min-w-0 lg:block`}>
          <div className="rounded-lg bg-[#dfe3ea] p-3 sm:p-5 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto">
            <ResumePreview resume={resumeData} design={design} printRef={printRef} showPageBreaks />
          </div>
        </div>
      </div>
    </>
  )
}

export default EditorWorkspace
