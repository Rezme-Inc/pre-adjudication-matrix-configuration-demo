import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'

type DecisionRow = {
  offense_name: string
  decision_level: 'Always Eligible' | 'Job Dependent' | 'Always Review'
  look_back_period: number | null
  notes?: string | null
}

type BatchRow = {
  batch_id: string
  submitted_by_name?: string | null
  username?: string | null
  responses: DecisionRow[]
  submitted_at?: string | null
}

const OFFENSES = [
  // 'Possession of Marijuana (Drug)',
  // 'Possession of Opioids (Drug)',
  // 'Destruction of Property (Property)',
  // 'Driving While Intoxicated/DUI (Driving)',
  // 'Distribution of Amphetamines (Drug)',
  // 'Taxation Offense (Property)',
  // 'Theft/Larceny (Property)',
  // 'Robbery (Violent)',
  // 'Resisting Arrest (Public Order)',
  // 'Aggravated Assault (Violent)',
  // 'Motor Vehicle Theft (Property)',
  // 'Vehicular Manslaughter (Driving/Violent)'
  "Driving While Intoxicated (DWI)",
  "Simple Assault",
  "Disorderly Conduct",
  "Forgery/Fraud",
  "Distribution of Amphetamines",
  "Burglary",
  "Possession of Marijuana",
  "Parole Violation",
  "Voluntary Manslaughter",

]

export default function AdminDashboard(): JSX.Element {
  const [batches, setBatches] = useState<BatchRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'percentages' | 'years'>('percentages')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('decisions_batch')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(200)

      if (!mounted) return
      if (fetchError) {
        setError(fetchError.message)
      } else {
        setBatches((data as any) ?? [])
      }
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel('public:decisions_batch')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'decisions_batch' },
        (payload) => {
          setBatches((prev) => [payload.new as BatchRow, ...prev].slice(0, 200))
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  const aggregate = useMemo(() => {
    type Stat = {
      Green: number
      Yellow: number
      Red: number
      total: number
      pct: { Green: number; Yellow: number; Red: number }
      meanYears: number | null
      medianYears: number | null
      modeYears: number | null
    }

    const map: Record<string, Stat> = {}
    for (const off of OFFENSES) {
      map[off] = {
        Green: 0,
        Yellow: 0,
        Red: 0,
        total: 0,
        pct: { Green: 0, Yellow: 0, Red: 0 },
        meanYears: null,
        medianYears: null,
        modeYears: null,
      }
    }

    const statsForOffense = (off: string) => {
      const values: number[] = []
      let green = 0
      let yellow = 0
      let red = 0

      batches.forEach((b) => {
        const responses = (b.responses as DecisionRow[]) || []
        responses.forEach((r) => {
          if (r.offense_name !== off) return
          const lvl = r.decision_level
          if (lvl === 'Always Eligible') green += 1
          else if (lvl === 'Job Dependent') yellow += 1
          else if (lvl === 'Always Review') red += 1
          if (typeof r.look_back_period === 'number') values.push(r.look_back_period)
        })
      })

      const total = green + yellow + red

      const pct = {
        Green: total ? (green / total) * 100 : 0,
        Yellow: total ? (yellow / total) * 100 : 0,
        Red: total ? (red / total) * 100 : 0,
      }

      const meanYears = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null

      const medianYears = (() => {
        if (!values.length) return null
        const sorted = [...values].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
      })()

      const modeYears = (() => {
        if (!values.length) return null
        const freq = new Map<number, number>()
        let max = 0
        values.forEach((v) => {
          const c = (freq.get(v) || 0) + 1
          freq.set(v, c)
          if (c > max) max = c
        })
        // collect modes, pick smallest if multiple
        const modes = Array.from(freq.entries()).filter(([_, c]) => c === max).map(([v]) => v)
        modes.sort((a, b) => a - b)
        return modes.length ? modes[0] : null
      })()

      return { Green: green, Yellow: yellow, Red: red, total, pct, meanYears, medianYears, modeYears }
    }

    for (const off of OFFENSES) {
      map[off] = statsForOffense(off)
    }

    return map
  }, [batches])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin — Submissions (live)</h2>
        {error && <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200 mb-4">{error}</div>}
        <div className="text-gray-600 mb-6">
          <strong>Recent batches:</strong> {batches.length} (live updates enabled)
        </div>
      </div>

      <section className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Aggregated statistics by offense</h3>
        
        {/* Tabs */}
        <div className="flex space-x-2 mb-4 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('percentages')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'percentages'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Review Options
          </button>
          <button
            onClick={() => setActiveTab('years')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'years'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lookback Period
          </button>
        </div>

        {/* Percentages Table */}
        {activeTab === 'percentages' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Offense</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Always Eligible %</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Job Dependent %</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Always Review %</th>
                </tr>
              </thead>
              <tbody>
                {OFFENSES.map((off) => {
                  const row = aggregate[off]
                  return (
                    <tr key={off} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="text-center py-4 px-4 text-sm text-gray-900">{off}</td>
                      <td className="text-center py-4 px-6">
                        {row ? <span className="pill pill-always-eligible">{row.pct.Green.toFixed(1)}%</span> : '—'}
                      </td>
                      <td className="text-center py-4 px-6">
                        {row ? <span className="pill pill-job-dependent">{row.pct.Yellow.toFixed(1)}%</span> : '—'}
                      </td>
                      <td className="text-center py-4 px-6">
                        {row ? <span className="pill pill-always-review">{row.pct.Red.toFixed(1)}%</span> : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Years Table */}
        {activeTab === 'years' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Offense</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Mean yrs</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Median yrs</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Mode yrs</th>
                </tr>
              </thead>
              <tbody>
                {OFFENSES.map((off) => {
                  const row = aggregate[off]
                  return (
                    <tr key={off} className="border-b border-gray-200 hover:bg-gray-100">
                      <td className="text-center py-4 px-4 text-sm text-gray-900">{off}</td>
                      <td className="text-center py-4 px-4 text-sm text-gray-700">{row && row.meanYears !== null ? row.meanYears.toFixed(2) : '—'}</td>
                      <td className="text-center py-4 px-4 text-sm text-gray-700">{row && row.medianYears !== null ? row.medianYears.toFixed(2) : '—'}</td>
                      <td className="text-center py-4 px-4 text-sm text-gray-700">{row && row.modeYears !== null ? String(row.modeYears) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Most recent batches</h3>
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : (
          <ul className="space-y-3">
            {batches.map((b) => (
              <li key={b.batch_id} className="bg-white p-3 rounded-md border border-gray-200">
                <div className="mb-1">
                  <strong className="text-gray-900">{b.submitted_by_name ?? 'Unknown'}</strong> —{' '}
                  <small className="text-gray-500">{new Date(b.submitted_at ?? '').toLocaleString()}</small>
                </div>
                <div className="text-sm text-gray-600">
                  {((b.responses || []) as DecisionRow[])
                    .slice(0, 6)
                    .map((r) => (
                      `${r.offense_name}: ${r.decision_level}${r.look_back_period ? ` (${r.look_back_period}yr)` : ''}`
                    ))
                    .join(' — ')}
                  {((b.responses || []) as DecisionRow[]).length > 6 && ' — …'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
