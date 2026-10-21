// Row of totals on the admin dashboard.
import { Link } from 'react-router-dom'

function StatStrip({ stats }) {
  return (
    <dl className="grid grid-cols-2 overflow-hidden rounded-lg border-[3px] border-ink bg-paper sm:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="border-b border-line px-4 py-4 last:border-b-0 sm:border-r xl:border-b-0 xl:last:border-r-0">
          <dt className="board-text text-[13px] text-ink-soft">{stat.label}</dt>
          <dd className="font-board tabular text-5xl leading-none font-bold">{stat.value}</dd>
          {stat.to && (
            <dd className="mt-2">
              <Link to={stat.to} className="text-sm font-semibold text-navy underline">{stat.linkLabel}</Link>
            </dd>
          )}
        </div>
      ))}
    </dl>
  )
}

export default StatStrip
