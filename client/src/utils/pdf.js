// PDF download settings. We print the page so the text stays readable for ATS.
// A4 page; keep background colours.
// The page margin is 0 so the browser has no room to print its date, title, URL and page number.
// The resume adds the margin itself, repeated on every page (box-decoration-break: clone).
export const PRINT_PAGE_STYLE = `
  @page { size: A4; margin: 0; }
  html, body { margin: 0; background: #ffffff; }
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .resume-page {
    padding: 12mm 14mm;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
`

// "Aarav_Sharma_Nimbus_Labs_Resume" (becomes the suggested PDF file name)
export function buildPdfFileName(resume) {
  const parts = [resume.personal?.fullName || 'Resume', resume.companyName, 'Resume']
  return parts
    .filter(Boolean)
    .join(' ')
    .replace(/[^a-zA-Z0-9]+/g, '_')
}
