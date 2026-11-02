// The three built-in templates (site configuration). Each one is a preset of the design settings.
// The ids stay "modern", "classic" and "minimal" so resumes saved before keep working.
// Loaded into MongoDB by: npm run seed-catalog
const templates = [
  {
    id: 'modern',
    name: 'Tech',
    description: "In the style of Jake's Resume: serif font, black headings with a line, centred name. Education first, then experience and projects.",
    design: {
      font: 'serif',
      accentColor: '#000000',
      headingStyle: 'caps-line',
      spacing: 'compact',
      sectionOrder: ['summary', 'education', 'experience', 'projects', 'skills', 'certifications'],
    },
  },
  {
    id: 'classic',
    name: 'Campus Placement',
    description: 'For freshers: sans-serif with dark blue headings. Education with CGPA and 12th / 10th marks comes first, then projects and internships.',
    design: {
      font: 'sans',
      accentColor: '#1e3a8a',
      headingStyle: 'caps-line',
      spacing: 'roomy',
      sectionOrder: ['summary', 'education', 'projects', 'experience', 'skills', 'certifications'],
    },
  },
  {
    id: 'minimal',
    name: 'Professional',
    description: 'For people with work experience: summary and experience first, in black and dark grey only.',
    design: {
      font: 'calibri',
      accentColor: '#333333',
      headingStyle: 'bold',
      spacing: 'roomy',
      sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications', 'projects'],
    },
  },
]

module.exports = templates
