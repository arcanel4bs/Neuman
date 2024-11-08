import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getOrCreateSession } from '@/utils/supabase/sessions'

export default async function DataRankingPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Get or create a session for the user
  const session = await getOrCreateSession(user.id)
  
  if (session) {
    redirect(`/data-ranking/${session.id}`)
  }

  redirect('/sign-in')
}
