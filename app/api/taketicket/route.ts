import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const supabaseAdmin = createClient(
  process.env.supabaseUrl!,
  process.env.SUPABASE_KEY!
)

export async function POST() {
  console.log(  process.env.SUPABASE_KEY!)
  const { data, error } = await supabaseAdmin.rpc("take_ticket")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ number: data })
}
