import { createClient } from '@/utils/supabase/server'
import ConsolePage from '@/components/ConsolePage'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  const { data: AiResponse } = await supabase.from('response').select()

  return <ConsolePage />
}