// Classic resume design (Times New Roman, formal).
import { SECTION_LABELS } from '../../data/sections'
import { splitBullets, formatDateRange, getContactItems, hasSectionContent } from '../../utils/resumeFormat'

function ClassicTemplate({ resume }) {
  const { personal } = resume

  // Draws one section (sections follow resume.sectionOrder)
  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case 'summary':
        return <p>{resume.summary}</p>
      case 'skills':
        return <p>{resume.skills.join(', ')}</p>
      case 'experience':
      case 'projects':
        return resume[sectionKey].map((entry) => (
          <div key={entry.id} className="mb-2.5 break-inside-avoid">
            <div className="flex justify-between gap-4">
              <strong>{sectionKey === 'experience' ? entry.jobTitle : entry.name}</strong>
              <span className="shrink-0">{sectionKey === 'experience' ? formatDateRange(entry.startDate, entry.endDate) : entry.link}</span>
            </div>
            <p className="italic">
              {sectionKey === 'experience' ? [entry.company, entry.location].filter(Boolean).join(', ') : entry.techStack}
            </p>
            <ul className="mt-1 list-disc pl-5">
              {splitBullets(entry.bullets).map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))
      case 'education':
        return resume.education.map((edu) => (
          <div key={edu.id} className="mb-1.5 flex justify-between gap-4">
            <div>
              <strong>{edu.degree}</strong>
              <p className="italic">{[edu.institution, edu.location].filter(Boolean).join(', ')}</p>
            </div>
            <div className="shrink-0 text-right">
              <p>{formatDateRange(edu.startYear, edu.endYear)}</p>
              <p>{edu.score}</p>
            </div>
          </div>
        ))
      case 'certifications':
        return (
          <ul className="list-disc pl-5">
            {resume.certifications.map((cert) => (
              <li key={cert.id}>
                <strong>{cert.name}</strong>
                {[cert.issuer, cert.year].filter(Boolean).length > 0 && ` – ${[cert.issuer, cert.year].filter(Boolean).join(', ')}`}
              </li>
            ))}
          </ul>
        )
      default:
        return null
    }
  }

  return (
    <article className="resume-page bg-white px-14 py-12 text-[14px] leading-[1.4] text-[#1b1b1b] print:p-0" style={{ fontFamily: '"Times New Roman", Times, Tinos, serif', fontVariantNumeric: 'lining-nums' }}>
      <header className="mb-3 text-center">
        <h1 className="text-[26px] leading-tight font-bold">{personal.fullName || 'Your Name'}</h1>
        <p className="mt-1 text-[12.5px]">{getContactItems(personal).join('  |  ')}</p>
      </header>

      {/* Sections in the company's preferred order */}
      {resume.sectionOrder
        .filter((sectionKey) => hasSectionContent(resume, sectionKey))
        .map((sectionKey) => (
          <section key={sectionKey} className="mt-3.5">
            <h2 className="mb-1.5 border-b border-[#1b1b1b] pb-0.5 text-[13px] font-bold tracking-[0.08em] uppercase">
              {SECTION_LABELS[sectionKey]}
            </h2>
            {renderSection(sectionKey)}
          </section>
        ))}
    </article>
  )
}

export default ClassicTemplate
