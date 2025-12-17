"use client"

import { useEffect, useState } from "react"

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zajfuusemjpbuxtjpbpn.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphamZ1dXNlbWpwYnV4dGpwYnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzAxMzAsImV4cCI6MjA4MTUwNjEzMH0.R4kSsGVzI_dWgzotlK33MT-7pLjIvuMh9OGV8jORsxw"

const supabase = createClient(supabaseUrl, supabaseKey) 

export default  function QueuePage() {
  const [myNumber, setMyNumber] = useState<number | null>(null)
  const [current, setCurrent] = useState<number>(0)
  const [loading, setLoading] = useState(false)


  async function getQueueNumber() {
  // await 等待 Promise 回傳
let { data, error } = await supabase
  .from('queue_state')
  .select("*")

  if (error) {
    console.error('Fetch error:', error)
    return
  }

  
}
  getQueueNumber()

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

  const takeTicket = async () => {
    setLoading(true)
    const res = await fetch("/api/taketicket", { method: "POST" })
    const data = await res.json()
    setMyNumber(data.number)
    localStorage.setItem("myNumber", data.number)
    setLoading(false)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>取號系統</h1>

      {myNumber ? (
        <>
          <p>🎫 你的號碼是</p>
          <h2 style={{ fontSize: 48 }}>{myNumber}</h2>
        </>
      ) : (
        <button onClick={takeTicket} disabled={loading}>
          {loading ? "取號中…" : "取號"}
        </button>
      )}

      <hr />

      <p>目前叫到：{current}</p>
      <p style={{ color: "#666" }}>
        📸 請截圖保存號碼，並留意現場叫號
      </p>
    </main>
  )
}
