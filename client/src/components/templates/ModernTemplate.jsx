// Modern resume design (navy header band).
import { SECTION_LABELS } from '../../data/sections'
import { splitBullets, formatDateRange, getContactItems, hasSectionContent } from '../../utils/resumeFormat'

const ACCENT = '#1d3a66'

function ModernTemplate({ resume }) {
  const { personal } = resume

  // Draws one section (sections follow resume.sectionOrder)
  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case 'summary':
        return <p>{resume.summary}</p>
      case 'skills':
        return (
          <ul className="flex flex-wrap gap-1.5">
            {resume.skills.map((skill) => (
              <li key={skill} className="rounded-[3px] border border-[#c9d2e0] px-1.5 py-px text-[12px]">
                {skill}
              </li>
            ))}
          </ul>
        )
      case 'experience':
      case 'projects':
        return resume[sectionKey].map((entry) => (
          <div key={entry.id} className="mb-3 break-inside-avoid">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[14px] font-bold">
                {sectionKey === 'experience' ? entry.jobTitle : entry.name}
                <span className="font-medium" style={{ color: ACCENT }}>
                  {' '}
                  {sectionKey === 'experience' ? entry.company && `· ${entry.company}` : entry.techStack && `· ${entry.techStack}`}
                </span>
              </h3>
              <span className="shrink-0 text-[12px] text-[#4a5160]">
                {sectionKey === 'experience' ? formatDateRange(entry.startDate, entry.endDate) : entry.link}
              </span>
            </div>
            <ul className="mt-1 list-disc pl-5 marker:text-[#8a96a8]">
              {splitBullets(entry.bullets).map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))
      case 'education':
        return resume.education.map((edu) => (
          <div key={edu.id} className="mb-1.5 flex items-baseline justify-between gap-4">
            <p>
              <strong>{edu.degree}</strong>
              {edu.institution && `, ${edu.institution}`}
              {edu.score && <span className="text-[#4a5160]"> · {edu.score}</span>}
            </p>
            <span className="shrink-0 text-[12px] text-[#4a5160]">{formatDateRange(edu.startYear, edu.endYear)}</span>
          </div>
        ))
      case 'certifications':
        return resume.certifications.map((cert) => (
          <p key={cert.id}>
            <strong>{cert.name}</strong>
            {[cert.issuer, cert.year].filter(Boolean).length > 0 && <span className="text-[#4a5160]"> · {[cert.issuer, cert.year].filter(Boolean).join(', ')}</span>}
          </p>
        ))
      default:
        return null
    }
  }

  return (
    <article className="resume-page bg-white px-12 py-10 text-[14px] leading-[1.45] text-[#1b1f27] print:p-0" style={{ fontFamily: 'Calibri, Carlito, Arial, Helvetica, sans-serif', fontVariantNumeric: 'lining-nums' }}>
      <header className="mb-4 rounded-[4px] px-6 py-5 text-white" style={{ backgroundColor: ACCENT, printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
        <h1 className="text-[30px] leading-none font-bold">{personal.fullName || 'Your Name'}</h1>
        {resume.roleTitle && <p className="mt-1.5 text-[15px] font-medium text-[#dbe4f2]">{resume.roleTitle}</p>}
        <p className="mt-2 text-[12px] text-[#dbe4f2]">{getContactItems(personal).join('   ·   ')}</p>
      </header>

      {/* Sections in the company's preferred order */}
      {resume.sectionOrder
        .filter((sectionKey) => hasSectionContent(resume, sectionKey))
        .map((sectionKey) => (
          <section key={sectionKey} className="mt-4">
            <h2 className="mb-1.5 text-[12px] font-bold tracking-[0.12em] uppercase" style={{ color: ACCENT }}>
              {SECTION_LABELS[sectionKey]}
            </h2>
            {renderSection(sectionKey)}
          </section>
        ))}
    </article>
  )
}

export default ModernTemplate
