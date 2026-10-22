// Draws a resume from a template's design settings (font, accent colour, heading style, spacing).
// Every template is one column of real text: no tables, images or columns, so an ATS can read it.
import { SECTION_LABELS } from '../../data/sections'
import { FONT_OPTIONS, withDesignDefaults } from '../../data/templateDesign'
import { splitBullets, formatDateRange, getContactItems, hasSectionContent } from '../../utils/resumeFormat'

// Sizes and gaps for each spacing setting
const SPACING = {
  compact: { page: 'px-12 py-10 text-[13px] leading-[1.35]', name: 'text-[24px]', section: 'mt-3', entry: 'mb-2' },
  roomy: { page: 'px-14 py-12 text-[14px] leading-[1.5]', name: 'text-[28px]', section: 'mt-5', entry: 'mb-3' },
}

// Body text stays near-black; dates and links are dark grey
const TEXT_COLOUR = '#111111'
const MUTED_COLOUR = '#444444'

function TemplateRenderer({ resume, design, ref }) {
  const { font, accentColor, headingStyle, spacing } = withDesignDefaults(design)
  const sizes = SPACING[spacing] || SPACING.compact
  const fontStack = (FONT_OPTIONS.find((option) => option.value === font) || FONT_OPTIONS[0]).stack
  const isRuled = headingStyle === 'caps-line'
  const { personal } = resume

  // One entry's top line: title on the left, date or link on the right
  const entryHeading = (title, detail) => (
    <div className="flex justify-between gap-4">
      <span>{title}</span>
      {detail && <span className="shrink-0" style={{ color: MUTED_COLOUR }}>{detail}</span>}
    </div>
  )

  // The "•" is real text (not a CSS dot), so it is copied with the PDF text and our import can find each bullet
  const bulletList = (lines) => (
    <ul className="mt-0.5">
      {lines.map((line, index) => (
        // Hanging indent: wrapped lines line up with the text, not the "•"
        <li key={index} className="pl-4 -indent-4">
          <span className="inline-block w-4 indent-0">•</span>
          {line}
        </li>
      ))}
    </ul>
  )

  // Draws one section (sections follow resume.sectionOrder)
  const renderSection = (sectionKey) => {
    switch (sectionKey) {
      case 'summary':
        return <p>{resume.summary}</p>
      case 'skills':
        return <p>{resume.skills.join(', ')}</p>
      case 'experience':
        return resume.experience.map((entry) => (
          <div key={entry.id} className={`${sizes.entry} break-inside-avoid`}>
            {entryHeading(<strong>{entry.jobTitle}</strong>, formatDateRange(entry.startDate, entry.endDate))}
            <p className="italic">{[entry.company, entry.location].filter(Boolean).join(', ')}</p>
            {bulletList(splitBullets(entry.bullets))}
          </div>
        ))
      case 'projects':
        return resume.projects.map((entry) => (
          <div key={entry.id} className={`${sizes.entry} break-inside-avoid`}>
            {entryHeading(
              <>
                <strong>{entry.name}</strong>
                {entry.techStack && <span className="italic"> | {entry.techStack}</span>}
              </>,
              entry.link
            )}
            {bulletList(splitBullets(entry.bullets))}
          </div>
        ))
      case 'education':
        // Plain lines, no table: degree and years, then institution and score (CGPA, 12th and 10th marks each get an entry)
        return resume.education.map((edu) => (
          <div key={edu.id} className={`${sizes.entry} break-inside-avoid`}>
            {entryHeading(<strong>{edu.degree}</strong>, formatDateRange(edu.startYear, edu.endYear))}
            <p>{[[edu.institution, edu.location].filter(Boolean).join(', '), edu.score].filter(Boolean).join(' | ')}</p>
          </div>
        ))
      case 'certifications':
        return bulletList(
          resume.certifications.map((cert) => (
            <>
              <strong>{cert.name}</strong>
              {[cert.issuer, cert.year].filter(Boolean).length > 0 && ` – ${[cert.issuer, cert.year].filter(Boolean).join(', ')}`}
            </>
          ))
        )
      default:
        return null
    }
  }

  // The accent colour is used only here: section headings and their lines
  const headingClasses = isRuled ? 'mb-1 border-b pb-0.5 text-[0.95em] font-bold tracking-[0.08em] uppercase' : 'mb-1 text-[1.1em] font-bold'

  return (
    <div ref={ref}>
      <article
        className={`resume-page bg-white print:p-0 ${sizes.page}`}
        style={{ fontFamily: fontStack, color: TEXT_COLOUR, fontVariantNumeric: 'lining-nums' }}
      >
        <header className={isRuled ? 'text-center' : 'text-left'}>
          <h1 className={`${sizes.name} leading-tight font-bold`}>{personal.fullName || 'Your Name'}</h1>
          {/* Each item stays on one line, so a long link is never split */}
          <p className="mt-1 text-[0.92em]">
            {getContactItems(personal).map((item, index) => (
              <span key={item}>
                {index > 0 && (isRuled ? '  |  ' : '  ·  ')}
                <span className="whitespace-nowrap">{item}</span>
              </span>
            ))}
          </p>
        </header>

        {resume.sectionOrder
          .filter((sectionKey) => hasSectionContent(resume, sectionKey))
          .map((sectionKey) => (
            <section key={sectionKey} className={sizes.section}>
              <h2 className={headingClasses} style={{ color: accentColor, borderColor: accentColor }}>
                {SECTION_LABELS[sectionKey]}
              </h2>
              {renderSection(sectionKey)}
            </section>
          ))}
      </article>
    </div>
  )
}

export default TemplateRenderer
