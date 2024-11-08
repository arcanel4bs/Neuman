'use client'

// Move the existing DataRankingPage code from app/data-ranking/page.tsx
// Add sessionId prop:
interface DataRankingPageProps {
  sessionId: string
}



import React, { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Star, Download, Copy, ChevronUp, ChevronDown, LogIn, ArrowLeft } from 'lucide-react'
import { Json } from '@/lib/database.types'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface ResponseMetadata {
  chunks_count?: number
  total_records?: number
  [key: string]: any
}

interface GenerationRecord {
  id: string
  prompt: string
  format: string
  data_size: string
  generated_data: Json
  created_at: string
  rating?: number
  upvotes: number
  downvotes: number
  metadata?: ResponseMetadata
}

export default function DataRankingPage({ sessionId }: DataRankingPageProps) {
  const router = useRouter()
  const [records, setRecords] = useState<GenerationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'score' | 'rating' | 'date'>('score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session || !!sessionId)
    })

    // If we have a sessionId, we're authenticated
    setIsAuthenticated(!!sessionId)
    fetchRecords()

    return () => {
      subscription.unsubscribe()
    }
  }, [sessionId])

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('response')
        .select(`
          id,
          prompt,
          format,
          data_size,
          generated_data,
          created_at,
          upvotes,
          downvotes,
          rating,
          metadata
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transformedData: GenerationRecord[] = (data || []).map(record => {
        let transformedMetadata: ResponseMetadata | undefined
        
        if (record.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata)) {
          const metadataObj = record.metadata as { [key: string]: Json | undefined }
          transformedMetadata = {
            chunks_count: typeof metadataObj.chunks_count === 'number' ? metadataObj.chunks_count : undefined,
            total_records: typeof metadataObj.total_records === 'number' ? metadataObj.total_records : undefined
          }
        }

        return {
          ...record,
          upvotes: record.upvotes || 0,
          downvotes: record.downvotes || 0,
          rating: record.rating || 0,
          metadata: transformedMetadata
        }
      })

      setRecords(transformedData)
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRate = (recordId: string, rating: number) => {
    requireAuth(async () => {
      try {
        const { error } = await supabase
          .from('response')
          .update({ rating })
          .eq('id', recordId)

        if (error) throw error

        setRecords(records.map(record => 
          record.id === recordId ? { ...record, rating } : record
        ))
      } catch (error) {
        console.error('Error updating rating:', error)
      }
    }, 'rate')
  }

  const handleSort = (type: 'score' | 'rating' | 'date') => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(type)
      setSortOrder('desc')
    }
  }

  const calculateScore = (upvotes: number, downvotes: number) => {
    const n = upvotes + downvotes
    if (n === 0) return 0
    
    const z = 1.96 // 95% confidence interval
    const p = upvotes / n
    
    // Wilson score interval
    const left = p + z * z / (2 * n)
    const right = z * Math.sqrt((p * (1 - p) + z * z / (4 * n)) / n)
    const under = 1 + z * z / n
    
    return (left - right) / under
  }

  const handleVote = (recordId: string, voteType: 'up' | 'down') => {
    handleInteraction(async () => {
      const currentVote = userVotes[recordId]
      let upvoteDelta = 0
      let downvoteDelta = 0

      if (currentVote === voteType) {
        // Remove vote
        upvoteDelta = voteType === 'up' ? -1 : 0
        downvoteDelta = voteType === 'down' ? -1 : 0
        setUserVotes(prev => ({ ...prev, [recordId]: null }))
      } else {
        // Change vote or add new vote
        if (currentVote) {
          upvoteDelta = voteType === 'up' ? 1 : -1
          downvoteDelta = voteType === 'down' ? 1 : -1
        } else {
          upvoteDelta = voteType === 'up' ? 1 : 0
          downvoteDelta = voteType === 'down' ? 1 : 0
        }
        setUserVotes(prev => ({ ...prev, [recordId]: voteType }))
      }

      const { error } = await supabase
        .from('response')
        .update({
          upvotes: records.find(r => r.id === recordId)!.upvotes + upvoteDelta,
          downvotes: records.find(r => r.id === recordId)!.downvotes + downvoteDelta
        })
        .eq('id', recordId)

      if (error) throw error

      setRecords(records.map(record => 
        record.id === recordId 
          ? { 
              ...record, 
              upvotes: record.upvotes + upvoteDelta,
              downvotes: record.downvotes + downvoteDelta
            } 
          : record
      ))
    }, 'vote')
  }

  const handleInteraction = async (action: () => Promise<void>, actionName: string) => {
    try {
      // If we have a sessionId, we're already authenticated
      if (!sessionId) {
        toast.error(`Please sign in to ${actionName}`)
        router.push('/sign-in')
        return
      }

      await action()
    } catch (error) {
      console.error(`Error ${actionName}:`, error)
      toast.error(`Failed to ${actionName}`)
    }
  }

  const handleCopy = (data: any) => {
    handleInteraction(async () => {
      await navigator.clipboard.writeText(
        typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      )
      toast.success('Copied to clipboard')
    }, 'copy')
  }

  const handleDownload = (data: any, prompt: string) => {
    handleInteraction(async () => {
      const blob = new Blob(
        [typeof data === 'string' ? data : JSON.stringify(data, null, 2)],
        { type: 'application/json' }
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${prompt.slice(0, 30)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'download')
  }

  const sortedRecords = [...records].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = calculateScore(a.upvotes, a.downvotes)
      const scoreB = calculateScore(b.upvotes, b.downvotes)
      return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB
    } else if (sortBy === 'rating') {
      return sortOrder === 'desc' 
        ? (b.rating || 0) - (a.rating || 0)
        : (a.rating || 0) - (b.rating || 0)
    } else {
      return sortOrder === 'desc'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
  })

  const requireAuth = (action: () => Promise<void>, actionName: string) => {
    if (!sessionId) {
      toast.error(`Please sign in to ${actionName}`)
      router.push('/sign-in')
      return
    }
    return action()
  }

  if (loading) {
    return <div className="min-h-screen bg-black p-8">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-light">Data Generation Rankings</h1>
          </div>
          {!sessionId && (
            <button
              onClick={() => router.push('/sign-in')}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign in to interact
            </button>
          )}
        </div>
        
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => handleSort('score')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${
              sortBy === 'score' 
                ? 'bg-gray-800/50 text-white' 
                : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            Popular
            {sortBy === 'score' && (sortOrder === 'desc' ? <ChevronDown /> : <ChevronUp />)}
          </button>
          <button
            onClick={() => handleSort('rating')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${
              sortBy === 'rating' 
                ? 'bg-gray-800/50 text-white' 
                : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            Sort by Rating
            {sortBy === 'rating' && (sortOrder === 'desc' ? <ChevronDown /> : <ChevronUp />)}
          </button>
          <button
            onClick={() => handleSort('date')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${
              sortBy === 'date' 
                ? 'bg-gray-800/50 text-white' 
                : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50 hover:text-white'
            }`}
          >
            Sort by Date
            {sortBy === 'date' && (sortOrder === 'desc' ? <ChevronDown /> : <ChevronUp />)}
          </button>
        </div>

        <div className="space-y-6">
          {sortedRecords.map((record) => (
            <div key={record.id} className="border border-gray-800 hover:border-gray-700 rounded-xl p-6 bg-gray-800/30">
              <div className="flex gap-4 mb-4">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => handleVote(record.id, 'up')}
                    className={`p-1 rounded-lg hover:bg-gray-800/50 transition-colors ${
                      !sessionId ? 'opacity-50 cursor-not-allowed' : ''
                    } ${userVotes[record.id] === 'up' ? 'text-green-500' : 'text-gray-400'}`}
                    disabled={!sessionId}
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <span className="text-sm text-gray-300">
                    {record.upvotes - record.downvotes}
                  </span>
                  <button
                    onClick={() => handleVote(record.id, 'down')}
                    className={`p-1 rounded-lg hover:bg-gray-800/50 transition-colors ${
                      !sessionId ? 'opacity-50 cursor-not-allowed' : ''
                    } ${userVotes[record.id] === 'down' ? 'text-red-500' : 'text-gray-400'}`}
                    disabled={!sessionId}
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-light mb-2 text-white">{record.prompt}</h2>
                  <div className="flex gap-2 text-sm">
                    <span className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full">
                      {record.format}
                    </span>
                    <span className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full">
                      {record.data_size}
                    </span>
                    {record.metadata?.total_records && (
                      <span className="bg-gray-800/50 text-gray-300 px-3 py-1 rounded-full">
                        {record.metadata.total_records} records
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(record.id, star)}
                      className={`hover:text-yellow-400 transition-colors ${
                        !sessionId ? 'opacity-50 cursor-not-allowed' : ''
                      } ${(record.rating || 0) >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                      disabled={!sessionId}
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative bg-gray-800/50 rounded-xl">
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(record.generated_data)}
                    className="p-1.5 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(record.generated_data, record.prompt)}
                    className="p-1.5 hover:bg-gray-700/50 rounded-lg text-gray-400 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  <pre className="text-sm p-4 whitespace-pre-wrap font-mono text-gray-300">
                    {typeof record.generated_data === 'string'
                      ? record.generated_data
                      : JSON.stringify(record.generated_data, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-400 mt-4">
                <div className="flex gap-4">
                  <span>Created: {new Date(record.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{record.metadata?.chunks_count || 1} chunks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{record.metadata?.total_records || 'N/A'} records</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
