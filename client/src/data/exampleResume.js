// An example resume (a made-up student), used ONLY to draw previews: the templates gallery and the
// landing page's sample ATS report. It is never saved to the database or sent to the server.
import { buildJobDescription } from '../utils/jobDescription'

const EXAMPLE_JOB_TEXT = `Frontend Developer (0-2 years)
We are looking for a Frontend Developer to build fast, accessible web interfaces.
Responsibilities:
- Build reusable React components with TypeScript and modern state management
- Write responsive, cross-browser layouts with HTML5, CSS3 and Tailwind CSS
- Integrate REST APIs and handle loading and error states
- Improve web performance and accessibility (WCAG)
- Write unit tests with Jest and take part in code review
Requirements: strong JavaScript, React, Git, data structures fundamentals, ownership mindset.`

const exampleResume = {
  id: 'example',
  title: 'Example – Frontend Developer',
  companyId: '',
  companyName: '',
  roleId: 'frontend-developer',
  roleTitle: 'Frontend Developer',
  templateId: 'classic',
  sectionOrder: ['summary', 'skills', 'projects', 'experience', 'education', 'certifications'],
  personal: {
    fullName: 'Aarav Sharma',
    email: 'aarav@example.com',
    phone: '+91 98200 12345',
    location: 'Mumbai, Maharashtra',
    linkedin: 'linkedin.com/in/aarav-example',
    portfolio: 'github.com/aarav-example',
  },
  summary:
    'B.Tech in Computer Science and Engineering student graduating in 2027, applying for Frontend Developer roles. Skilled in JavaScript, React, HTML, CSS and Tailwind CSS. Key project: Campus Events Portal (React, Node.js, Express, MongoDB). Built a portal used by 800+ students to find and register for college events. Worked as Web Developer Intern at Brightpath Software.',
  skills: ['JavaScript', 'React', 'HTML', 'CSS', 'Tailwind CSS', 'REST APIs', 'Git', 'Data Structures', 'Node.js', 'Express', 'MongoDB', 'Java', 'Python', 'SQL'],
  experience: [
    {
      id: 'exp-1',
      jobTitle: 'Web Developer Intern',
      company: 'Brightpath Software (example)',
      location: 'Remote',
      startDate: 'May 2026',
      endDate: 'Jul 2026',
      bullets:
        'Built 12 reusable React components for an internal dashboard, cutting new-page development time by 30%\nImproved the Lighthouse performance score from 62 to 91 by lazy-loading images and splitting bundles\nFixed 40+ cross-browser and accessibility issues reported during testing',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Science and Engineering',
      institution: 'Vidyanagar Institute of Technology (example)',
      location: 'Mumbai',
      startYear: '2023',
      endYear: '2027',
      score: 'CGPA 8.6 / 10',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Campus Events Portal',
      techStack: 'React, Node.js, Express, MongoDB',
      link: 'github.com/aarav-example/campus-events',
      bullets:
        'Built a portal used by 800+ students to find and register for college events\nDeveloped REST APIs for events, sign-ups and admin approval with JWT login\nAdded search and filters that return results in under 100 ms',
    },
    {
      id: 'proj-2',
      name: 'Expense Tracker',
      techStack: 'React, Firebase, Chart.js',
      link: 'github.com/aarav-example/expense-tracker',
      bullets: 'Built a responsive app to log daily spending, used by 50 friends and classmates\nCreated monthly charts that show spending by category',
    },
  ],
  certifications: [
    { id: 'cert-1', name: 'Responsive Web Design', issuer: 'freeCodeCamp', year: '2025' },
    { id: 'cert-2', name: 'Programming in Java', issuer: 'NPTEL', year: '2025' },
  ],
  jobDescription: buildJobDescription(EXAMPLE_JOB_TEXT, { title: 'Frontend Developer' }),
}

export default exampleResume
