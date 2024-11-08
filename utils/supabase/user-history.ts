import { createClient } from './server'
import type { Database } from '@/lib/database.types'

type UserHistory = Database['public']['Tables']['user_history']['Row']

export async function getUserHistory(): Promise<UserHistory[] | null> {
  const supabase = await createClient()
  const { data: userHistory } = await supabase
    .from('user_history')
    .select('*')
    .returns<UserHistory[]>()
  
  return userHistory
}


