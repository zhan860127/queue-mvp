"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://zajfuusemjpbuxtjpbpn.supabase.co"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphamZ1dXNlbWpwYnV4dGpwYnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzAxMzAsImV4cCI6MjA4MTUwNjEzMH0.R4kSsGVzI_dWgzotlK33MT-7pLjIvuMh9OGV8jORsxw"

const supabase = createClient(supabaseUrl, supabaseKey)

export default function AdminPage() {
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 讀取目前號碼
    supabase
      .from("queue_state")
      .select("cur")
      .eq("id", 1)
      .single()
      .then(res => setCurrent(res.data?.cur ?? 0))

    // 即時更新
    const channel = supabase
      .channel("queue")
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", table: "queue_state" },
          (payload: any) => {
          setCurrent(payload.new.cur)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const next = async () => {
    if (loading) return
    setLoading(true)
    await fetch("/api/nextnumber", { method: "POST" })
    setLoading(false)
  }

  const reset = async () => {
    
    await fetch("/api/reset", { method: "POST" })
    
  }
  return (
    <>
      <main className="admin">
        <h1 className="title">叫號控制台</h1>

        <div className="card">
          <p className="label">目前叫到</p>
          <div className="number">{current}</div>

          <button
            className="nextBtn"
            onClick={next}
            disabled={loading}
          >
            {loading ? "叫號中…" : "叫下一號"}
          </button>
          <button
            className="nextBtn reset"
            onClick={reset}
            
          >
            重置
          </button>
        </div>
      </main>

      <style jsx>{`
        .admin {
          min-height: 100vh;
          background: #f4f4f4;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 16px;
          font-family: system-ui, -apple-system;
        }

        .title {
          font-size: 22px;
          margin-bottom: 24px;
          color: #333;
        }

        .card {
          width: 100%;
          max-width: 360px;
          background: #fff;
          border-radius: 20px;
          padding: 32px 24px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .label {
          font-size: 14px;
          color: #777;
          margin-bottom: 8px;
        }

        .number {
          font-size: 64px;
          font-weight: 700;
          color: #222;
          margin-bottom: 24px;
        }

        .nextBtn {
          width: 100%;
          height: 64px;
          font-size: 20px;
          border-radius: 999px;
          border: none;
          background: #3b7c3b;
          color: white;
          font-weight: 600;
          cursor: pointer;
          margin-bottom:20px
        }

        .nextBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}
