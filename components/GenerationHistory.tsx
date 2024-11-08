'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/utils/supabase/client'
import type { Database } from '@/lib/database.types'
import { Json } from '@/lib/database.types'

interface GenerationRecord {
  id: string
  prompt: string
  format: string
  data_size: string
  generated_data: Json
  created_at: string
  status: string
  metadata: {
    chunks_count?: number
    total_records?: number
  }
  rating?: number
  upvotes?: number
  downvotes?: number
}

export default function GenerationHistory({ sessionId }: { sessionId: string }) {
  const [history, setHistory] = useState<GenerationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!sessionId) return
    
    try {
      const { data, error } = await supabase
        .from('response')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }
      
      const formattedData: GenerationRecord[] = (data || []).map(item => ({
        id: item.id,
        prompt: item.prompt,
        format: item.format,
        data_size: item.data_size,
        generated_data: item.generated_data,
        created_at: item.created_at,
        status: item.status,
        metadata: {
          chunks_count: (item.metadata as any)?.chunks_count,
          total_records: (item.metadata as any)?.total_records
        },
        rating: item.rating,
        upvotes: item.upvotes,
        downvotes: item.downvotes
      }))
      
      setHistory(formattedData)
    } catch (err) {
      console.error('History fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch history')
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    let mounted = true

    const initFetch = async () => {
      if (!mounted) return
      await fetchHistory()
    }

    initFetch()

    // Set up realtime subscription
    const channel = supabase
      .channel(`response:${sessionId}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'response',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          if (mounted) {
            fetchHistory()
          }
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [fetchHistory, sessionId])

  const formatData = (data: any, format: string) => {
    if (format === 'JSON') {
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        return JSON.stringify(parsed, null, 2)
      } catch (e) {
        return data
      }
    }
    return data
  }

  const renderDataPreview = (record: GenerationRecord) => {
    const formattedData = formatData(record.generated_data, record.format)
    const preview = typeof formattedData === 'string' 
      ? formattedData.slice(0, 200) 
      : JSON.stringify(formattedData).slice(0, 200)

    return (
      <div className="mt-4">
        <div className="bg-secondary/50 rounded-lg p-4">
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
            {preview}
            {formattedData.length > 200 && '...'}
          </pre>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => navigator.clipboard.writeText(formattedData)}
            className="text-sm text-primary hover:text-primary/80 px-2 py-1"
          >
            Copy Full Data
          </button>
          <button
            onClick={() => window.open(`data:text/plain;charset=utf-8,${encodeURIComponent(formattedData)}`)}
            className="text-sm text-primary hover:text-primary/80 px-2 py-1"
          >
            Download
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        <div className="bg-destructive/10 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Error loading history</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center text-muted-foreground p-4">
          <p>No history generated yet...</p>
        </div>
      </div>
    )
  }

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
              {record.metadata?.total_records && (
                <span className="bg-secondary px-2 py-1 rounded">
                  {record.metadata.total_records} records
                </span>
              )}
            </div>
            {renderDataPreview(record)}
          </div>
        ))}
      </div>
    </div>
  )
} 