import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DataRankingPage from '@/components/DataRankingPage'

export default async function DataRankingSessionPage({ 
  params 
}: { 
  params: Promise<{ sessionId: string }> 
}) {
  const { sessionId } = await params
  
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Validate that the session exists and belongs to the user
  const { data: session } = await supabase
    .from('console_sessions')
    .select()
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) {
    redirect('/data-ranking')
  }

  return <DataRankingPage sessionId={sessionId} />
}
