import { SupabaseClient } from '@supabase/supabase-js'

export async function getLatestEventId(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase
    .from('events')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data?.id ?? null
}
