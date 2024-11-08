import { createClient } from './server'

export async function getOrCreateSession(userId: string) {
  const supabase = await createClient()
  
  // Try to get existing session
  const { data: existingSession } = await supabase
    .from('console_sessions')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existingSession) {
    return existingSession
  }

  // Create new session if none exists
  const { data: newSession } = await supabase
    .from('console_sessions')
    .insert([{
      user_id: userId,
      title: 'New Session'
    }])
    .select()
    .single()

  return newSession
}

export async function updateSessionLastAccessed(sessionId: string) {
  const supabase = await createClient()
  
  await supabase
    .from('console_sessions')
    .update({ last_accessed: new Date().toISOString() })
    .eq('id', sessionId)
}

export async function validateUserSession(userId: string, sessionId: string) {
  const supabase = await createClient()
  
  const { data: session } = await supabase
    .from('console_sessions')
    .select()
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  return session
} 