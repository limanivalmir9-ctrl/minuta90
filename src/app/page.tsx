"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [matches, setMatches] = useState<any[]>([])
  const [teamsMap, setTeamsMap] = useState<Record<string, any>>({})
  const [compsMap, setCompsMap] = useState<Record<string, any>>({})
  const [filter, setFilter] = useState<'all'|'live'|'finished'|'scheduled'>('all')

  useEffect(() => {
    const fetchAll = async () => {
      const { data: teams } = await supabase.from("teams").select("*")
      const { data: comps } = await supabase.from("competitions").select("*")
      const tMap: any = {}; const cMap: any = {}
      teams?.forEach(t => tMap[t.id] = t)
      comps?.forEach(c => cMap[c.id] = c)
      setTeamsMap(tMap); setCompsMap(cMap)
      const { data: m } = await supabase.from("matches").select("*").order("match_date", {ascending:false})
      setMatches(m||[])
    }
    fetchAll()
    const ch = supabase.channel('flash').on('postgres_changes',{event:'*',schema:'public',table:'matches'}, fetchAll).subscribe()
    return ()=> { supabase.removeChannel(ch) }
  }, [])

  const filtered = matches.filter(m => filter==='all' ? true : m.status===filter)
  const grouped: Record<string, any[]> = {}
  filtered.forEach(m => {
    const comp = compsMap[m.competition_id]?.name || 'Superliga'
    if(!grouped[comp]) grouped[comp]=[]
    grouped[comp].push(m)
  })

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* HEADER si FlashScore */}
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-50">
        <div className="max-w- mx-auto px-3 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00ff85] rounded flex items-center justify-center font-black text-black">90</div>
            <h1 className="text- font-black tracking-tight">MINUTA<span className="text-[#00ff85]">90</span>.LIVE</h1>
            <span className="ml-3 hidden md:flex bg-[#2a2a2a] rounded-full px-3 py-1 text- text-zinc-400">⚽  Superliga • Liga 1 • Kupa</span>
          </div>
          <div className="flex gap-2">
            <a href="/admin" className="bg-[#2a2a2a] hover:bg-[#333] px-3 py-1.5 rounded-full text-">Admin</a>
            <a href="/agent" className="bg-[#00ff85] text-black px-3 py-1.5 rounded-full text- font-black">Agjenti PRO</a>
          </div>
        </div>
        {/* TABS si FlashScore */}
        <div className="max-w- mx-auto px-3 flex gap-1 pb-2 overflow-x-auto">
          {[
            {id:'all', label:'TË GJITHA'},
            {id:'live', label:'LIVE', dot:true},
            {id:'scheduled', label:'NESËR'},
            {id:'finished', label:'PËRFUNDUAR'},
          ].map(tab=>(
            <button key={tab.id} onClick={()=> setFilter(tab.id as any)} className={`px-4 py-2 rounded-full text- font-bold tracking-wide flex items-center gap-1.5 transition ${filter===tab.id?'bg-white text-black':'bg-[#2a2a2a] text-zinc-400 hover:bg-[#333]'}`}>
              {tab.dot && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w- mx-auto">
        {Object.entries(grouped).map(([league, leagueMatches])=>(
          <div key={league} className="mt-4">
            {/* Liga Header si FlashScore */}
            <div className="bg-[#1e1e1e] px-3 py-2 flex items-center gap-2 text- font-bold text-zinc-300 border-y border-[#2a2a2a]">
              <span className="text-">🏆</span> {league}
              <span className="ml-auto text- bg-[#2a2a2a] px-2 py-0.5 rounded-full">{leagueMatches.length}</span>
            </div>
            
            {/* Ndeshjet */}
            <div className="bg-[#171717] divide-y divide-[#222]">
              {leagueMatches.map((m:any)=>{
                const home = teamsMap[m.home_team_id] || teamsMap[m.home_club_id] || {name:'Vendas'}
                const away = teamsMap[m.away_team_id] || teamsMap[m.away_club_id] || {name:'Mysafir'}
                const isLive = m.status==='live'
                return (
                  <div key={m.id} className="px-3 py-3 flex items-center gap-3 hover:bg-[#1e1e1e] cursor-pointer group">
                    {/* Minuta / Statusi */}
                    <div className="w- text- font-mono">
                      {isLive ? <span className="text-[#00ff85] font-black animate-pulse">{m.minute||45}'</span> : <span className="text-zinc-500">{m.match_date ? new Date(m.match_date).toLocaleTimeString('sq-AL',{hour:'2-digit',minute:'2-digit'}) : '17:00'}</span>}
                      <div className={`text- mt-0.5 ${isLive?'text-[#00ff85]':'text-zinc-600'}`}>{isLive?'LIVE':m.status?.toUpperCase()}</div>
                    </div>

                    {/* Ekipet */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <img src={home.logo_url || 'https://via.placeholder.com/20'} className="w-5 h-5 rounded-full bg-white/5 object-cover" />
                        <span className={`text- ${isLive?'font-bold text-white':'text-zinc-200'}`}>{home.name}</span>
                        {m.home_score>0 && isLive && <span className="ml-auto w-2 h-2 bg-[#00ff85] rounded-full animate-pulse"></span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <img src={away.logo_url || 'https://via.placeholder.com/20'} className="w-5 h-5 rounded-full bg-white/5 object-cover" />
                        <span className={`text- ${isLive?'font-bold text-white':'text-zinc-200'}`}>{away.name}</span>
                      </div>
                    </div>

                    {/* Rezultati - si FlashScore */}
                    <div className="text-right min-w-">
                      <div className={`text- font-black tabular-nums ${isLive?'text-[#00ff85]':'text-white'}`}>{m.home_score ?? 0}</div>
                      <div className={`text- font-black tabular-nums ${isLive?'text-[#00ff85]':'text-white'}`}>{m.away_score ?? 0}</div>
                    </div>

                    {/* Shigjeta */}
                    <div className="text-zinc-600 group-hover:text-white">›</div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {matches.length===0 && (
          <div className="mt-20 text-center">
            <div className="text-5xl mb-3">⚽</div>
            <div className="text-zinc-500 text-sm">Nuk ka ndeshje sot</div>
            <a href="/admin" className="mt-4 inline-block bg-[#00ff85] text-black px-6 py-2 rounded-full font-black text-sm">Shto Ndeshje te Admin</a>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <div className="mt-10 border-t border-[#222] py-6 text-center text- text-zinc-600">
        © 2026 MINUTA90.LIVE • Live Score nga Kosova • Të dhënat rifreskohen live
      </div>
    </div>
  )
}