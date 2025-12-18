import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const supabaseAdmin = createClient(
  process.env.supabaseUrl!,
  process.env.SUPABASE_KEY!
)
export async function POST() {
   const { data, error } = await supabaseAdmin.rpc("reset")
  
  
  return NextResponse.json({ ok: !data })
}
