import { createClient } from "@supabase/supabase-js";


export default async function UserHistory() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data: userHistory } = await supabase.from('user_history').select();
    return userHistory;
    
}


