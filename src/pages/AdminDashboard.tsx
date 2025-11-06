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
  recipient_emails?: string[] | null
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
    <div style={{ padding: 20 }}>
      <h2>Admin — Submissions (live)</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div style={{ marginBottom: 16 }}>
        <strong>Recent batches:</strong> {batches.length} (live updates enabled)
      </div>

      <section style={{ marginBottom: 24 }}>
        <h3>Aggregated statistics by offense</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Offense</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Always Eligible %</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Job Dependent %</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Always Review %</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Mean yrs</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Median yrs</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Mode yrs</th>
              <th style={{ borderBottom: '1px solid #ccc' }}>Votes</th>
            </tr>
          </thead>
          <tbody>
            {OFFENSES.map((off) => {
              const row = aggregate[off]
              return (
                <tr key={off}>
                  <td style={{ padding: '8px 4px' }}>{off}</td>
                  <td style={{ textAlign: 'center' }}>
                    {row ? <span className="pill pill-always-eligible">{row.pct.Green.toFixed(1)}%</span> : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row ? <span className="pill pill-job-dependent">{row.pct.Yellow.toFixed(1)}%</span> : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row ? <span className="pill pill-always-review">{row.pct.Red.toFixed(1)}%</span> : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>{row && row.meanYears !== null ? row.meanYears.toFixed(2) : '—'}</td>
                  <td style={{ textAlign: 'center' }}>{row && row.medianYears !== null ? row.medianYears.toFixed(2) : '—'}</td>
                  <td style={{ textAlign: 'center' }}>{row && row.modeYears !== null ? String(row.modeYears) : '—'}</td>
                  <td style={{ textAlign: 'center' }}>{row ? row.total : 0}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h3>Most recent batches</h3>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul>
            {batches.map((b) => (
              <li key={b.batch_id} style={{ marginBottom: 8 }}>
                <div>
                  <strong>{b.submitted_by_name ?? 'Unknown'}</strong> —{' '}
                  <small>{new Date(b.submitted_at ?? '').toLocaleString()}</small>
                </div>
                <div style={{ fontSize: 13, color: '#333' }}>
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
