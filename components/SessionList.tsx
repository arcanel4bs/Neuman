import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Database } from '@/lib/database.types'
import { supabase } from '@/utils/supabase/client'

interface Session {
  id: string
  title: string
  created_at: string
  last_accessed: string
}

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    async function loadSessions() {
      const { data: sessions } = await supabase
        .from('console_sessions')
        .select()
        .order('last_accessed', { ascending: false })
      
      if (sessions) {
        setSessions(sessions)
      }
    }

    const channel = supabase
      .channel('sessions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'console_sessions' 
      }, loadSessions)
      .subscribe()

    loadSessions()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="space-y-4">
      <Link
        href="/console"
        className="block p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        New Session
      </Link>
      
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={`/console/${session.id}`}
          className="block p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <h3 className="font-medium">{session.title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(session.created_at).toLocaleDateString()}
          </p>
        </Link>
      ))}
    </div>
  )
} 