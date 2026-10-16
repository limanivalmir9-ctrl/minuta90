"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const [pass, setPass] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [show, setShow] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass }),
    })
    if (res.ok) {
      router.push("/admin")
    } else {
      setError("Password i gabuar!")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-orange-600/20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w- h- bg-red-600/30 rounded-full blur- -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w- h- bg-orange-600/20 rounded-full blur-" />

      <div className="w-full max-w- relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 mb-4 shadow-2xl shadow-red-600/20">
            <span className="text-2xl font-black text-white">90</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            MINUTA<span className="text-red-500">90</span>
          </h1>
          <p className="text-zinc-400 text-sm mt-2 tracking-widest uppercase">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded- p-8 shadow-2xl">
          <h2 className="text-white font-semibold text-xl mb-1">Mirë se erdhe!</h2>
          <p className="text-zinc-500 text-sm mb-6">Vendosi passwordin për të vazhduar</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Passwordi"
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:bg-zinc-800 transition-all pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition p-1"
              >
                {show ? "🙈" : "👁️"}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !pass}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 text-white font-semibold rounded-xl py-3.5 transition-all shadow-lg shadow-red-600/20 disabled:shadow-none active:scale-[0.98]"
            >
              {loading ? "Duke hyrë..." : "Hyr në Panel →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-600">
            <span>© 2026 Minuta90</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Secure
            </span>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-6">
          Vetëm për administratorët e autorizuar
        </p>
      </div>
    </div>
  )
}