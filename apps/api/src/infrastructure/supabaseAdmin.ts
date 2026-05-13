import { createClient } from '@supabase/supabase-js'

const supabaseUrl      = process.env.SUPABASE_URL!
const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos')
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
