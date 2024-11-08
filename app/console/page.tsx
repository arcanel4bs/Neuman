import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DefaultConsolePage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Get or create initial session
  const { data: existingSession } = await supabase
    .from('console_sessions')
    .select()
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!existingSession) {
    const { data: newSession } = await supabase
      .from('console_sessions')
      .insert([{
        user_id: user.id,
        title: 'New Session'
      }])
      .select()
      .single()

    if (newSession) {
      redirect(`/console/${newSession.id}`)
    }
    // Add fallback if somehow both queries fail
    throw new Error('Failed to create or retrieve console session')
  }
  
  // If we have an existing session, redirect to it
  redirect(`/console/${existingSession.id}`)
}