// Minimal resume design (compact).
import { SECTION_LABELS } from '../../data/sections'
import { splitBullets, formatDateRange, getContactItems, hasSectionContent } from '../../utils/resumeFormat'

function MinimalTemplate({ resume }) {
  const { personal } = resume

  // Draws one section (sections follow resume.sectionOrder)
  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case 'summary':
        return <p>{resume.summary}</p>
      case 'skills':
        return <p>{resume.skills.join('  ·  ')}</p>
      case 'experience':
      case 'projects':
        return resume[sectionKey].map((entry) => (
          <div key={entry.id} className="mb-2 break-inside-avoid">
            <p className="flex justify-between gap-4">
              <span>
                <strong className="font-semibold">{sectionKey === 'experience' ? entry.jobTitle : entry.name}</strong>
                {sectionKey === 'experience' ? entry.company && `, ${entry.company}` : entry.techStack && ` (${entry.techStack})`}
              </span>
              <span className="shrink-0 text-[#555]">{sectionKey === 'experience' ? formatDateRange(entry.startDate, entry.endDate) : entry.link}</span>
            </p>
            <ul className="list-disc pl-4">
              {splitBullets(entry.bullets).map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))
      case 'education':
        return resume.education.map((edu) => (
          <p key={edu.id} className="flex justify-between gap-4">
            <span>
              <strong className="font-semibold">{edu.degree}</strong>
              {edu.institution && `, ${edu.institution}`}
              {edu.score && ` · ${edu.score}`}
            </span>
            <span className="shrink-0 text-[#555]">{formatDateRange(edu.startYear, edu.endYear)}</span>
          </p>
        ))
      case 'certifications':
        return (
          <p>
            {resume.certifications
              .map((cert) => [cert.name, cert.issuer, cert.year].filter(Boolean).join(', '))
              .join('  ·  ')}
          </p>
        )
      default:
        return null
    }
  }

  return (
    <article className="resume-page bg-white px-12 py-10 text-[13px] leading-[1.4] text-[#222] print:p-0" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontVariantNumeric: 'lining-nums' }}>
      <header className="mb-2 border-b border-[#bbb] pb-2">
        <h1 className="text-[22px] leading-tight font-semibold tracking-[-0.01em]">{personal.fullName || 'Your Name'}</h1>
        <p className="mt-0.5 text-[11.5px] text-[#444]">{getContactItems(personal).join('  ·  ')}</p>
      </header>

      {/* Sections in the company's preferred order */}
      {resume.sectionOrder
        .filter((sectionKey) => hasSectionContent(resume, sectionKey))
        .map((sectionKey) => (
          <section key={sectionKey} className="mt-2.5">
            <h2 className="mb-0.5 text-[11px] font-semibold tracking-[0.14em] text-[#555] uppercase">{SECTION_LABELS[sectionKey]}</h2>
            {renderSection(sectionKey)}
          </section>
        ))}
    </article>
  )
}

export default MinimalTemplate
