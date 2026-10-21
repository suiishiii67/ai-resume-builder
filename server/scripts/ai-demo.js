// Shows the AI improving weak bullets: npm run ai-demo
// Uses the same code as POST /api/ai/bullets and prints before / after and which model answered.
require('dotenv').config({ quiet: true })
const { writeBullets } = require('../controllers/aiController')

const weakBullets = [
  'Worked on weekly sales reports in Excel for the store operations team',
  'Made a Power BI dashboard to track sales across 12 stores',
  'Helped the team with data entry and preparing presentations',
]

const jobDescription = `Data Analyst (0-2 years)
We are looking for a Data Analyst to build reports and dashboards for our retail business.
Skills: SQL, Excel, Power BI, data cleaning, presenting insights to stakeholders.`

async function runDemo() {
  console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'set' : 'not set'}\n`)

  console.log('BEFORE')
  weakBullets.forEach((bullet) => console.log(`  • ${bullet}`))

  const { result, model } = await writeBullets(weakBullets.join('\n'), jobDescription)

  console.log(`\nAFTER (answered by ${model})`)
  result.bullets.forEach((bullet) => console.log(`  • ${bullet}`))

  // Simple fact check: every number in the answer must be one the user wrote
  const numbersBefore = new Set(weakBullets.join(' ').match(/\d+/g) || [])
  const numbersAfter = result.bullets.join(' ').match(/\d+/g) || []
  const newNumbers = numbersAfter.filter((number) => !numbersBefore.has(number))
  console.log(`\nNumbers kept: ${[...numbersBefore].every((number) => numbersAfter.includes(number)) ? 'yes' : 'NO'}`)
  console.log(`New numbers added: ${newNumbers.length ? newNumbers.join(', ') : 'none'}`)
}

runDemo().catch((error) => {
  console.error(`AI demo failed: ${error.message}`)
  process.exitCode = 1
})
