'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

interface GenerationRecord {
  id: string
  prompt: string
  format: string
  data_size: string
  generated_data: any
  created_at: string
  status: string
  metadata: {
    chunks_count: number
    total_records: number
  }
}

export default function GenerationHistory() {
  const [history, setHistory] = useState<GenerationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('response')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setHistory(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4">Loading history...</div>
  if (error) return <div className="p-4 text-destructive">Error: {error}</div>

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">History</h2>
      <div className="space-y-4">
        {history.map((record) => (
          <div key={record.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium">{record.prompt}</div>
              <div className="text-sm text-muted-foreground">
                {new Date(record.created_at).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground mb-2">
              <span className="bg-secondary px-2 py-1 rounded">
                {record.format}
              </span>
              <span className="bg-secondary px-2 py-1 rounded">
                {record.data_size}
              </span>
              <span className="bg-secondary px-2 py-1 rounded">
                {record.metadata.total_records} records
              </span>
            </div>
            <div className="mt-2">
              <button
                onClick={() => {
                  const dataToCopy = typeof record.generated_data === 'string' 
                    ? record.generated_data 
                    : JSON.stringify(record.generated_data, null, 2);
                  navigator.clipboard.writeText(dataToCopy);
                }}
                className="text-sm text-primary hover:text-grey-800 px-2 py-1"
              >
                Copy Data
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 