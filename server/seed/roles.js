// Job roles (site configuration): required skills, keywords and example text shown as hints.
// Loaded into MongoDB by: npm run seed-catalog
const roles = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Engineering',
    requiredSkills: ['JavaScript', 'React', 'HTML5', 'CSS3', 'Tailwind CSS', 'TypeScript', 'Git', 'REST APIs', 'Responsive Design', 'Jest'],
    keywords: ['responsive', 'accessibility', 'component', 'performance', 'cross-browser', 'state management'],
    sampleSummary:
      'Frontend developer skilled in React, JavaScript and responsive design, focused on fast and accessible user interfaces. Looking to help {company} turn product requirements into clean, reusable components.',
    experienceBullets: [
      'Built 12 reusable React components for an internal dashboard, cutting new-page development time by 30%',
      'Improved the Lighthouse performance score from 62 to 91 by lazy-loading images and splitting bundles',
      'Fixed 40+ cross-browser and accessibility issues reported during QA',
      'Worked with designers to deliver responsive layouts that matched Figma specs on mobile and desktop',
    ],
    projects: [
      {
        name: 'Campus Events Portal',
        techStack: 'React, Tailwind CSS, Firebase',
        bullets: [
          'Built a responsive portal used by 800+ students to discover and register for college events',
          'Added search and filters with debounced input, keeping results under 100 ms',
        ],
      },
      {
        name: 'Weather Dashboard',
        techStack: 'JavaScript, REST APIs, Chart.js',
        bullets: [
          'Fetched live forecast data from a public REST API and charted 7-day trends',
          'Cached responses in local storage to cut repeat API calls by 70%',
        ],
      },
    ],
    certifications: [
      { name: 'Responsive Web Design', issuer: 'freeCodeCamp' },
      { name: 'Programming in JavaScript', issuer: 'NPTEL' },
    ],
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    category: 'Engineering',
    requiredSkills: ['Node.js', 'Express', 'MongoDB', 'SQL', 'REST APIs', 'Java', 'Git', 'Docker', 'Postman', 'JWT'],
    keywords: ['API', 'database', 'scalable', 'authentication', 'caching', 'server-side'],
    sampleSummary:
      'Backend developer experienced in Node.js, Express and databases, focused on secure, scalable APIs. Eager to help {company} build reliable server-side systems.',
    experienceBullets: [
      'Designed 15 REST API endpoints in Node.js and Express for an order-tracking system',
      'Reduced average API response time by 45% by adding indexes and Redis caching',
      'Implemented JWT authentication and role-based access for 3 user types',
      'Wrote API tests in Postman and documented every endpoint for the frontend team',
    ],
    projects: [
      {
        name: 'Library Management API',
        techStack: 'Node.js, Express, MongoDB',
        bullets: [
          'Built a REST API for book issue and return with fine calculation',
          'Added input validation and centralised error handling for all routes',
        ],
      },
      {
        name: 'URL Shortener Service',
        techStack: 'Java, Spring Boot, MySQL',
        bullets: [
          'Generated short codes with collision checks and click analytics',
          'Containerised the service with Docker for one-command setup',
        ],
      },
    ],
    certifications: [
      { name: 'Database Management System', issuer: 'NPTEL' },
      { name: 'Back End Development and APIs', issuer: 'freeCodeCamp' },
    ],
  },
  {
    id: 'full-stack-developer',
    title: 'Full Stack Developer',
    category: 'Engineering',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'Git', 'HTML5', 'CSS3', 'Deployment'],
    keywords: ['MERN', 'end-to-end', 'full stack', 'API', 'database', 'responsive'],
    sampleSummary:
      'Full stack developer who builds end-to-end MERN applications, from responsive React screens to Node.js APIs and MongoDB data models. Ready to help {company} ship complete features.',
    experienceBullets: [
      'Built a MERN stack attendance app end-to-end, now used by 6 departments',
      'Created REST APIs and React screens for 10+ features with shared validation',
      'Deployed the frontend and backend with CI, cutting release time from a day to 20 minutes',
      'Reviewed pull requests and wrote setup docs for 4 junior contributors',
    ],
    projects: [
      {
        name: 'Hostel Mess Feedback System',
        techStack: 'MongoDB, Express, React, Node.js',
        bullets: [
          'Built daily menu ratings with charts for the mess committee',
          'Added admin login and CSV export for monthly reports',
        ],
      },
      {
        name: 'Placement Prep Tracker',
        techStack: 'React, Node.js, MongoDB',
        bullets: [
          'Let students log practice problems and see weekly progress',
          'Built streaks and topic-wise breakdowns with aggregation queries',
        ],
      },
    ],
    certifications: [
      { name: 'Full Stack Web Development', issuer: 'Online course' },
      { name: 'Cloud Computing', issuer: 'NPTEL' },
    ],
  },
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    category: 'Engineering',
    requiredSkills: ['Java', 'Python', 'Data Structures', 'Algorithms', 'OOP', 'SQL', 'Git', 'Linux', 'Unit Testing', 'Problem Solving'],
    keywords: ['data structures', 'algorithms', 'object-oriented', 'debugging', 'testing', 'code review'],
    sampleSummary:
      'Software engineer with strong foundations in data structures, algorithms and object-oriented design, comfortable in Java and Python. Keen to write well-tested, maintainable code at {company}.',
    experienceBullets: [
      'Solved 450+ data structures and algorithms problems across competitive programming platforms',
      'Refactored a legacy Java module using OOP principles, reducing bugs reported by 35%',
      'Wrote unit tests that raised code coverage from 40% to 78%',
      'Debugged production issues using logs on Linux servers and documented root causes',
    ],
    projects: [
      {
        name: 'Railway Reservation Simulator',
        techStack: 'Java, OOP, File I/O',
        bullets: [
          'Modelled trains, coaches and bookings with classes and interfaces',
          'Implemented waitlist confirmation using a priority queue',
        ],
      },
      {
        name: 'Expense Splitter',
        techStack: 'Python, SQLite',
        bullets: [
          'Minimised the number of settlements between friends with a greedy algorithm',
          'Covered core logic with 30 unit tests',
        ],
      },
    ],
    certifications: [
      { name: 'Programming, Data Structures and Algorithms using Python', issuer: 'NPTEL' },
      { name: 'Object Oriented Programming in Java', issuer: 'Online course' },
    ],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data',
    requiredSkills: ['SQL', 'Excel', 'Python', 'Pandas', 'Power BI', 'Tableau', 'Statistics', 'Data Cleaning', 'Data Visualization', 'Reporting'],
    keywords: ['dashboard', 'insights', 'KPI', 'analysis', 'data-driven', 'stakeholder'],
    sampleSummary:
      'Data analyst skilled in SQL, Excel, Python and Power BI, turning raw data into clear dashboards and insights. Looking to support data-driven decisions at {company}.',
    experienceBullets: [
      'Built a Power BI dashboard tracking 12 sales KPIs, used in weekly management reviews',
      'Cleaned and merged 50,000+ rows of survey data in Python (Pandas), cutting manual work by 8 hours a week',
      'Wrote SQL queries to find a 15% drop-off in the signup funnel and presented the analysis',
      'Automated monthly Excel reports with pivot tables and lookups',
    ],
    projects: [
      {
        name: 'City Air Quality Analysis',
        techStack: 'Python, Pandas, Matplotlib',
        bullets: [
          'Analysed 3 years of public air quality data across 10 cities',
          'Visualised seasonal trends and shared insights in a short report',
        ],
      },
      {
        name: 'College Placement Dashboard',
        techStack: 'SQL, Power BI',
        bullets: [
          'Modelled 5 years of placement data and built branch-wise KPI views',
          'Highlighted top recruiters and salary trends for the placement cell',
        ],
      },
    ],
    certifications: [
      { name: 'Data Analytics with Python', issuer: 'NPTEL' },
      { name: 'Data Visualization', issuer: 'Online course' },
    ],
  },
  {
    id: 'ui-ux-designer',
    title: 'UI/UX Designer',
    category: 'Design',
    requiredSkills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'Design Systems', 'Information Architecture', 'Interaction Design', 'Accessibility', 'HTML/CSS'],
    keywords: ['user-centered', 'persona', 'journey map', 'usability', 'prototype', 'design system'],
    sampleSummary:
      'UI/UX designer who uses user research, wireframes and Figma prototypes to design simple, accessible products. Excited to bring user-centered design to {company}.',
    experienceBullets: [
      'Interviewed 15 users and turned findings into 3 personas and a journey map',
      'Designed and tested Figma prototypes, raising the task success rate from 60% to 88%',
      'Built a design system of 40 components shared by designers and developers',
      'Ran 4 rounds of usability testing and prioritised fixes with the product team',
    ],
    projects: [
      {
        name: 'Canteen Pre-order App Redesign',
        techStack: 'Figma, User Research',
        bullets: [
          'Redesigned the ordering flow from 7 steps to 4 after observing peak-hour queues',
          'Validated the prototype with 10 students in moderated usability tests',
        ],
      },
      {
        name: 'Accessible Library Portal',
        techStack: 'Figma, HTML/CSS',
        bullets: [
          'Designed screens to WCAG AA contrast and keyboard navigation',
          'Documented components and spacing rules for developers',
        ],
      },
    ],
    certifications: [
      { name: 'Design Thinking', issuer: 'NPTEL' },
      { name: 'UX Design Fundamentals', issuer: 'Online course' },
    ],
  },
]

module.exports = roles
