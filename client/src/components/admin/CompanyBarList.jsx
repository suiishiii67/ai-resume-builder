// Bar list: a name and a count per row (resumes per company, missing skills …).
function CompanyBarList({ counts, label = 'Resumes per target company' }) {
  const rows = Object.entries(counts).sort((first, second) => second[1] - first[1])
  const largest = Math.max(1, ...rows.map(([, count]) => count))

  return (
    <ul className="space-y-3" aria-label={label}>
      {rows.map(([companyName, count]) => (
        <li key={companyName} className="grid grid-cols-[minmax(0,10rem)_1fr_2rem] items-center gap-3 text-[15px]">
          <span className="truncate font-medium" title={companyName}>{companyName}</span>
          <span className="h-3 rounded-r-[4px] bg-navy" style={{ width: `${(count / largest) * 100}%` }} title={`${companyName}: ${count}`} />
          <span className="tabular text-right font-semibold">{count}</span>
        </li>
      ))}
    </ul>
  )
}

export default CompanyBarList
