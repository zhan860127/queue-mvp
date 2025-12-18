"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import Head from "next/head"

const supabaseUrl = "https://zajfuusemjpbuxtjpbpn.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphamZ1dXNlbWpwYnV4dGpwYnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MzAxMzAsImV4cCI6MjA4MTUwNjEzMH0.R4kSsGVzI_dWgzotlK33MT-7pLjIvuMh9OGV8jORsxw"
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Page() {
  const [myNumber, setMyNumber] = useState<number | null>(null)
  const [current, setCurrent] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 初始讀取目前叫號
      const cur = localStorage.getItem("myNumber")
      if(cur){
        setMyNumber(Number(cur))
      }
    
  
    supabase
      .from("queue_state")
      .select("cur")
      .eq("id", 1)
      .single()
      .then(res => {
        setCurrent(res.data?.cur ?? 0)
      })

    // 即時訂閱
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

  const takeTicket = async () => {
    setLoading(true)
    const res = await fetch("/api/taketicket", { method: "POST" })
    const data = await res.json()
    setMyNumber(data.number)
    localStorage.setItem("myNumber", data.number)
    setLoading(false)
  }

  return (
    <>
      <main className="page">
        <Head>
        <title>我的首頁</title>
        <meta name="description" content="這是首頁描述" />
        </Head>
        <div className="logoWrap">
          <img src="/logo.jpg" alt="清嶼 Tranquil Island" className="logo" />
        </div>

        <section className="card">
          <h1 className="title">取號系統</h1>

          {myNumber ? (
            <>
              <p className="label">你的號碼</p>
              <div className="number">{myNumber}</div>
            </>
          ) : (
            <button
              className="button"
              onClick={takeTicket}
              disabled={loading}
            >
              {loading ? "取號中…" : "取號"}
            </button>
          )}

          <div className="divider" />

          <p className="current">
            目前叫到 <strong>{current}</strong> 號
          </p>

          <p className="hint">
            請截圖保存號碼，並留意現場叫號
          </p>
        </section>
      </main>

      {/* 直接寫在 page.tsx 裡 */}
      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #a7be8c;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont;
        }

        .logoWrap {
  background: #ffffff;
  
  
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.logo {
  width: 50vw;
  display: block;
  
}


        .card {
          width: 100%;
          max-width: 360px;
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .title {
          color: #2b2b2b;
          font-size: 20px;
          margin-bottom: 16px;
          letter-spacing: 1px;
        }

        .label {
          color: #666;
          margin-bottom: 8px;
        }

        .number {
          font-size: 56px;
          font-weight: 600;
          color: #2b2b2b;
          margin-bottom: 16px;
        }

        .button {
          width: 100%;
          padding: 14px 0;
          font-size: 18px;
          background: #a7be8c;
          color: #ffffffff;
          border: none;
          border-radius: 999px;
          cursor: pointer;
        }

        .button:disabled {
          opacity: 0.6;
        }

        .divider {
          height: 1px;
          background: #eee;
          margin: 24px 0;
        }

        .current {
          font-size: 16px;
          color: #2b2b2b;
          margin-bottom: 8px;
        }

        .hint {
          font-size: 12px;
          color: #777;
        }
      `}</style>
    </>
  )
}
