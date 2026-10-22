// Hidden full-size copy of a resume, used for PDF download from the dashboard.
import TemplateRenderer from './templates/TemplateRenderer'

function PrintableResume({ resume, design, printRef }) {
  if (!resume) return null

  return (
    <div aria-hidden="true" className="fixed top-0 -left-[10000px] w-[794px]">
      <TemplateRenderer ref={printRef} resume={resume} design={design} />
    </div>
  )
}

export default PrintableResume
