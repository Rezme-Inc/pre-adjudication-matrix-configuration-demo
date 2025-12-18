import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { NO_TIME_LIMIT } from '../App'

type DecisionRow = {
  offense_name: string
  decision_level: 'Always Eligible' | 'Job Dependent' | 'Always Review'
  look_back_period: number
  notes?: string | null
  job_specific_risk_tags?: string[] | null
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
  const [activeTab, setActiveTab] = useState<'percentages' | 'years' | 'riskTags'>('percentages')
  const [showBatches, setShowBatches] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

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
          // Only include actual year values (1-10), exclude 0 (N/A) and 25 (No time limit)
          if (typeof r.look_back_period === 'number' && r.look_back_period > 0 && r.look_back_period < NO_TIME_LIMIT) {
            values.push(r.look_back_period)
          }
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

  // Pagination calculations
  const totalPages = Math.ceil(batches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBatches = batches.slice(startIndex, endIndex)

  // Reset to page 1 when batches change
  useEffect(() => {
    setCurrentPage(1)
  }, [batches.length])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div style={{ padding: '1.5rem' }} className="bg-white rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }} className="font-bold text-gray-900">Admin Dashboard</h2>
              <p style={{ fontSize: '1rem' }} className="text-gray-500">Live submission tracking</p>
            </div>
            <div className="text-right">
              <div style={{ fontSize: '1rem', marginBottom: '0.25rem' }} className="text-gray-500">Total Submissions</div>
              <div style={{ fontSize: '3rem', fontWeight: '900' }} className="text-[#0F206C]">{batches.length}</div>
            </div>
          </div>
          {error && <div className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200 mt-4">{error}</div>}
        </div>

        {/* Statistics Section */}
        <section className="bg-white rounded-xl shadow-lg border-2 border-gray-300">
          <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.025em' }} className="text-gray-900">Aggregated Statistics by Offense</h1>
          </div>

          {/* Tabs */}
          <div style={{ gap: '0.75rem', paddingLeft: '1rem', paddingRight: '1rem' }} className="flex">
            <button
              onClick={() => setActiveTab('percentages')}
              style={{
                paddingLeft: '2rem',
                paddingRight: '2rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '800',
                borderRadius: '0.5rem 0.5rem 0 0',
                backgroundColor: activeTab === 'percentages' ? '#0F206C' : '#f3f4f6',
                color: activeTab === 'percentages' ? 'white' : '#374151',
                borderWidth: '2px',
                borderBottomWidth: activeTab === 'percentages' ? '0' : '2px',
                borderColor: activeTab === 'percentages' ? '#0F206C' : '#d1d5db',
                borderStyle: 'solid',
                cursor: 'pointer'
              }}
              className="transition-all"
            >
              Review Options
            </button>
            <button
              onClick={() => setActiveTab('years')}
              style={{
                paddingLeft: '2rem',
                paddingRight: '2rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '800',
                borderRadius: '0.5rem 0.5rem 0 0',
                backgroundColor: activeTab === 'years' ? '#0F206C' : '#f3f4f6',
                color: activeTab === 'years' ? 'white' : '#374151',
                borderWidth: '2px',
                borderBottomWidth: activeTab === 'years' ? '0' : '2px',
                borderColor: activeTab === 'years' ? '#0F206C' : '#d1d5db',
                borderStyle: 'solid',
                cursor: 'pointer'
              }}
              className="transition-all"
            >
              Lookback Period
            </button>
            <button
              onClick={() => setActiveTab('riskTags')}
              style={{
                paddingLeft: '2rem',
                paddingRight: '2rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '800',
                borderRadius: '0.5rem 0.5rem 0 0',
                backgroundColor: activeTab === 'riskTags' ? '#0F206C' : '#f3f4f6',
                color: activeTab === 'riskTags' ? 'white' : '#374151',
                borderWidth: '2px',
                borderBottomWidth: activeTab === 'riskTags' ? '0' : '2px',
                borderColor: activeTab === 'riskTags' ? '#0F206C' : '#d1d5db',
                borderStyle: 'solid',
                cursor: 'pointer'
              }}
              className="transition-all"
            >
              Risk Tags
            </button>
          </div>

          <div style={{ borderTopWidth: '3px', borderColor: '#0F206C', borderStyle: 'solid' }}></div>

          {/* Percentages Table */}
          {activeTab === 'percentages' && (
            <div style={{ padding: '2rem' }} className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottomWidth: '2px', borderBottomColor: '#d1d5db', borderBottomStyle: 'solid' }}>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'left', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Offense</th>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Always Eligible</th>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Job Dependent</th>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Always Review</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  {OFFENSES.map((off, idx) => {
                    const row = aggregate[off]
                    return (
                      <tr key={off} style={{ borderBottomWidth: idx !== OFFENSES.length - 1 ? '1px' : '0', borderBottomColor: '#e5e7eb', borderBottomStyle: 'solid' }} className="hover:bg-gray-50 transition-colors">
                        <td style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1.1rem', fontWeight: '700' }} className="text-gray-900">{off}</td>
                        <td style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center' }}>
                          {row ? (
                            <span style={{ backgroundColor: '#3b82f6', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderRadius: '9999px', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', minWidth: '100px' }}>
                              {row.pct.Green.toFixed(1)}%
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center' }}>
                          {row ? (
                            <span style={{ backgroundColor: '#a855f7', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderRadius: '9999px', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', minWidth: '100px' }}>
                              {row.pct.Yellow.toFixed(1)}%
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center' }}>
                          {row ? (
                            <span style={{ backgroundColor: '#f97316', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '1.5rem', paddingRight: '1.5rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderRadius: '9999px', fontSize: '1.1rem', fontWeight: '800', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', minWidth: '100px' }}>
                              {row.pct.Red.toFixed(1)}%
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Risk Tags Table */}
          {activeTab === 'riskTags' && (
            <div style={{ padding: '2rem' }} className="overflow-x-auto">
              <div className="mb-4">
                <p className="text-gray-600 text-sm">
                  Showing frequency of risk tags selected for "Job Dependent" decisions
                </p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottomWidth: '2px', borderBottomColor: '#d1d5db', borderBottomStyle: 'solid' }}>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'left', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Risk Tag</th>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Count</th>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Percentage</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  {(() => {
                    // Aggregate risk tags across all Job Dependent responses
                    const tagCounts = new Map<string, number>()
                    let totalJobDependentCount = 0
                    
                    batches.forEach((b) => {
                      const responses = (b.responses as DecisionRow[]) || []
                      responses.forEach((r) => {
                        if (r.decision_level === 'Job Dependent' && r.job_specific_risk_tags && Array.isArray(r.job_specific_risk_tags)) {
                          // Exclude 'always review' marker and empty arrays
                          if (!r.job_specific_risk_tags.includes('always review') && r.job_specific_risk_tags.length > 0) {
                            totalJobDependentCount++
                            r.job_specific_risk_tags.forEach(tag => {
                              tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
                            })
                          }
                        }
                      })
                    })
                    
                    // Sort tags by frequency (descending)
                    const sortedTags = Array.from(tagCounts.entries())
                      .sort((a, b) => b[1] - a[1])
                    
                    if (sortedTags.length === 0) {
                      return (
                        <tr>
                          <td colSpan={3} style={{ paddingTop: '2rem', paddingBottom: '2rem', textAlign: 'center', fontSize: '1rem' }} className="text-gray-500">
                            No risk tags selected yet
                          </td>
                        </tr>
                      )
                    }
                    
                    return sortedTags.map(([tag, count], idx) => {
                      const percentage = totalJobDependentCount > 0 ? (count / totalJobDependentCount) * 100 : 0
                      return (
                        <tr key={tag} style={{ borderBottomWidth: idx !== sortedTags.length - 1 ? '1px' : '0', borderBottomColor: '#e5e7eb', borderBottomStyle: 'solid' }} className="hover:bg-gray-50 transition-colors">
                          <td style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1rem', fontWeight: '600' }} className="text-gray-900">{tag}</td>
                          <td style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center' }}>
                            <span style={{ backgroundColor: '#a855f7', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: '700', minWidth: '60px' }}>
                              {count}
                            </span>
                          </td>
                          <td style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center' }}>
                            <span style={{ backgroundColor: '#a855f7', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '1rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', borderRadius: '9999px', fontSize: '1rem', fontWeight: '700', minWidth: '80px' }}>
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {/* Years Table */}
          {activeTab === 'years' && (
            <div style={{ padding: '2rem' }} className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottomWidth: '2px', borderBottomColor: '#d1d5db', borderBottomStyle: 'solid' }}>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'left', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Offense</th>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Mean Years</th>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Median Years</th>
                    <th style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="text-gray-900">Mode Years</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  {OFFENSES.map((off, idx) => {
                    const row = aggregate[off]
                    return (
                      <tr key={off} style={{ borderBottomWidth: idx !== OFFENSES.length - 1 ? '1px' : '0', borderBottomColor: '#e5e7eb', borderBottomStyle: 'solid' }} className="hover:bg-gray-50 transition-colors">
                        <td style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', paddingLeft: '2rem', paddingRight: '2rem', fontSize: '1.1rem', fontWeight: '700' }} className="text-gray-900">{off}</td>
                        <td style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1.25rem', fontWeight: '800' }} className="text-gray-900">
                          {row && row.meanYears !== null ? row.meanYears.toFixed(2) : '—'}
                        </td>
                        <td style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1.25rem', fontWeight: '800' }} className="text-gray-900">
                          {row && row.medianYears !== null ? row.medianYears.toFixed(2) : '—'}
                        </td>
                        <td style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', paddingLeft: '2rem', paddingRight: '2rem', textAlign: 'center', fontSize: '1.25rem', fontWeight: '800' }} className="text-gray-900">
                          {row && row.modeYears !== null ? String(row.modeYears) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent Batches Section */}
        <section className="bg-white rounded-lg shadow border border-gray-200">
          <button
            style={{ width: '100%', padding: '1.5rem', cursor: 'pointer', borderRadius: '0.5rem 0.5rem 0 0' }}
            className="flex items-center justify-between hover:bg-gray-50 transition-colors"
            onClick={() => setShowBatches(!showBatches)}
          >
            <div style={{ gap: '0.75rem' }} className="flex items-center">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2rem', height: '2rem', borderRadius: '9999px', backgroundColor: '#0F206C' }}>
                {showBatches ? (
                  <ChevronDown style={{ width: '1rem', height: '1rem' }} className="text-white" />
                ) : (
                  <ChevronUp style={{ width: '1rem', height: '1rem' }} className="text-white" />
                )}
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '700' }} className="text-gray-900">Recent Submissions</h3>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '600' }} className="text-gray-500">{batches.length} total</span>
          </button>

          {showBatches && (
            <div style={{ borderTopWidth: '1px', borderColor: '#e5e7eb', borderStyle: 'solid' }}>
              {loading ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '1rem' }} className="text-gray-500">Loading submissions...</div>
              ) : batches.length === 0 ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '1rem' }} className="text-gray-500">No submissions yet</div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    {currentBatches.map((b) => (
                      <div key={b.batch_id} style={{ padding: '1rem' }} className="hover:bg-gray-50 transition-colors">
                        <div style={{ marginBottom: '0.5rem' }} className="flex items-center justify-between">
                          <span style={{ fontSize: '1rem', fontWeight: '700' }} className="text-gray-900">
                            {b.submitted_by_name ?? b.username ?? 'Unknown'}
                          </span>
                          <span style={{ fontSize: '1rem', fontWeight: '500' }} className="text-gray-500">
                            {new Date(b.submitted_at ?? '').toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }} className="text-gray-600 line-clamp-2">
                          {((b.responses || []) as DecisionRow[])
                            .slice(0, 4)
                            .map((r) => {
                              const lookbackDisplay = r.look_back_period === 0
                                ? ''
                                : r.look_back_period === NO_TIME_LIMIT
                                  ? ' (No limit)'
                                  : ` (${r.look_back_period === 10 ? '10+' : r.look_back_period}yr)`
                              return `${r.offense_name}: ${r.decision_level}${lookbackDisplay}`
                            })
                            .join(' • ')}
                          {((b.responses || []) as DecisionRow[]).length > 4 && ' • ...'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Showing {startIndex + 1}-{Math.min(endIndex, batches.length)} of {batches.length} submissions
                      </div>
                      <div style={{ gap: '1rem' }} className="flex items-center">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-md border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                        >
                          Previous
                        </button>

                        {/* Page Numbers */}
                        <div style={{ gap: '0.75rem' }} className="flex items-center">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            const showPage = page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1

                            if (!showPage && page === 2 && currentPage > 4) {
                              return <span key={page} style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem' }} className="text-gray-400">...</span>
                            }
                            if (!showPage && page === totalPages - 1 && currentPage < totalPages - 3) {
                              return <span key={page} style={{ paddingLeft: '0.75rem', paddingRight: '0.75rem' }} className="text-gray-400">...</span>
                            }
                            if (!showPage) return null

                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.875rem' }}
                                className={`rounded-md transition-colors ${currentPage === page
                                  ? 'bg-[#0F206C] text-white'
                                  : 'border border-gray-300 hover:bg-gray-100'
                                  }`}
                              >
                                {page}
                              </button>
                            )
                          })}
                        </div>

                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-md border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
