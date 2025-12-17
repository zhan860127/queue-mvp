"use client"

import { useState } from "react"
import { useEffect } from "react"
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://zajfuusemjpbuxtjpbpn.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphamZ1dXNlbWpwYnV4dGpwYnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzAxMzAsImV4cCI6MjA4MTUwNjEzMH0.R4kSsGVzI_dWgzotlK33MT-7pLjIvuMh9OGV8jORsxw"

const supabase = createClient(supabaseUrl, supabaseKey) 
export default function AdminPage() {
  const [myNumber, setMyNumber] = useState<number | null>(null)
  const [current, setCurrent] = useState<number>(0)
  

      useEffect(() => {
    
        supabase
          .from("queue_state")
          .select("cur")
          .eq("id", 1)
          .single()
          .then(res => setCurrent(res.data?.cur ?? 0))
    
        // 即時訂閱
        const channel = supabase
          .channel("queue")
          .on(
            "postgres_changes",
            { event: "UPDATE", table: "queue_state" },
            payload => {
              setCurrent(payload.new.current_number)
            }
          )
          .subscribe()
    
        return () => {
          supabase.removeChannel(channel)
        }
      }, [])
  const [loading, setLoading] = useState(false)

  const next = async () => {
    setLoading(true)
    await fetch("/api/nextnumber", { method: "POST" })
    setLoading(false)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>叫號控制台</h1>
              <>
          
      <p>目前叫到：{current}</p>

        </>
      <button onClick={next} disabled={loading}>
        叫下一號
      </button>
    </main>
  )
}
