import { createClient } from '@/utils/supabase/server'
import ConsolePage from '@/components/ConsolePage'
import { redirect } from 'next/navigation'

export default async function ConsoleSessionPage({ 
  params 
}: { 
  params: Promise<{ sessionId: string }> | { sessionId: string }
}) {
  // Await the params to get the sessionId
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
    redirect('/console')
  }

  return <ConsolePage sessionId={sessionId} />
} 