"use client"

import Link from "next/link"
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { ArrowLeft, Download, Lock, LogOut, RefreshCw, Trash2 } from "lucide-react"
import { COUPLE } from "@/lib/constants"
import type { RsvpSubmission } from "@/lib/rsvpTypes"

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function RsvpAdminPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState("")
  const [submissions, setSubmissions] = useState<RsvpSubmission[]>([])

  const coming = submissions.filter((entry) => entry.attending).length

  const loadSubmissions = useCallback(async () => {
    const response = await fetch("/api/rsvp/admin/submissions", { cache: "no-store" })
    if (response.status === 401) {
      setAuthed(false)
      return
    }
    if (!response.ok) {
      setError("Unable to load the guest list.")
      return
    }
    const data = (await response.json()) as { submissions: RsvpSubmission[] }
    setSubmissions(data.submissions)
    setAuthed(true)
    setError("")
  }, [])

  useEffect(() => {
    void loadSubmissions()
  }, [loadSubmissions])

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/rsvp/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      if (!response.ok) {
        setError("Incorrect password.")
        return
      }
      setPassword("")
      await loadSubmissions()
    } catch {
      setError("Unable to sign in.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/rsvp/admin/logout", { method: "POST" })
    setAuthed(false)
    setSubmissions([])
  }

  const csvContent = useMemo(() => {
    const header = "Name,Attending,Message,Submitted\n"
    const rows = submissions
      .map((entry) => {
        const cells = [entry.name, entry.attending ? "Yes" : "No", entry.message, entry.createdAt]
        return cells.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      })
      .join("\n")
    return header + rows
  }, [submissions])

  const handleExport = () => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "ebenezer-loretta-rsvps.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = async () => {
    if (!window.confirm("Clear every RSVP? This cannot be undone.")) return
    setClearing(true)
    setError("")
    try {
      const response = await fetch("/api/rsvp/admin/clear", { method: "POST" })
      if (!response.ok) {
        setError("Unable to clear the list.")
        return
      }
      await loadSubmissions()
    } catch {
      setError("Unable to clear the list.")
    } finally {
      setClearing(false)
    }
  }

  return (
    <main className="page-wash min-h-svh px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-[#7d5a98] uppercase">
          <ArrowLeft className="h-4 w-4" />
          Back to the invitation
        </Link>
        <p className="mt-6 text-[10px] font-semibold tracking-[0.28em] text-[#7b3fa6] uppercase">Guest replies</p>
        <h1 className="serif mt-2 text-4xl text-[#3d215c]">{COUPLE.full}</h1>

        {!authed ? (
          <form onSubmit={handleLogin} className="mt-8 max-w-md rounded-3xl bg-[#faf8f6] p-6 shadow-[0_18px_40px_rgba(46,26,64,0.06)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full text-[#7b3fa6]" style={{ border: "1px solid rgba(123,63,166,0.35)" }}>
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="serif text-2xl text-[#3d215c]">Sign in</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6a5680]">Enter the owner password to read the replies.</p>
            <label className="mt-5 block text-xs font-semibold tracking-[0.14em] text-[#7d5a98] uppercase">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[rgba(123,63,166,0.35)] bg-[#faf8f6] px-3 py-3 text-base font-normal tracking-normal text-[#3d215c] normal-case"
                autoComplete="current-password"
                required
              />
            </label>
            {error ? <p className="mt-3 text-sm text-[#8a3a6e]">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-full bg-[#7b3fa6] px-4 py-3 text-xs font-semibold tracking-[0.16em] text-[#fbf7ff] uppercase"
            >
              {loading ? "Signing in..." : "Open the list"}
            </button>
          </form>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setRefreshing(true)
                  void loadSubmissions().finally(() => setRefreshing(false))
                }}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#3d215c] uppercase"
                style={{ border: "1px solid rgba(123,63,166,0.4)" }}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={submissions.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-[#7b3fa6] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#fbf7ff] uppercase disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </button>
              <button
                type="button"
                onClick={() => void handleClear()}
                disabled={clearing || submissions.length === 0}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#8a3a6e] uppercase disabled:opacity-40"
                style={{ border: "1px solid rgba(138,58,110,0.35)" }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.12em] text-[#6a5680] uppercase sm:ml-auto"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>

            <p className="mt-6 text-sm text-[#6a5680]">
              {submissions.length} {submissions.length === 1 ? "reply" : "replies"} · {coming} coming · {submissions.length - coming} unable to attend
            </p>

            {error ? <p className="mt-3 text-sm text-[#8a3a6e]">{error}</p> : null}

            {submissions.length === 0 ? (
              <p className="serif mt-10 text-center text-2xl text-[#3d215c]">No replies yet</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {submissions.map((entry) => (
                  <li key={entry.id} className="rounded-2xl bg-[#faf8f6] px-5 py-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="serif text-2xl text-[#3d215c]">{entry.name}</p>
                      <p className="text-xs font-semibold tracking-[0.12em] text-[#7b3fa6] uppercase">
                        {entry.attending ? "Attending" : "Unable"}
                      </p>
                    </div>
                    {entry.message ? <p className="mt-2 text-sm leading-relaxed text-[#6a5680]">{entry.message}</p> : null}
                    <p className="mt-2 text-[11px] tracking-[0.08em] text-[#9a84ae] uppercase">{formatDate(entry.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  )
}
