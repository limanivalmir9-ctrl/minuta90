"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

// TROFEU YT - SVG PERFEKT (20px)
function TrophyIcon({ active }: { active: boolean }) {
  return[STRIPPED 18 bytes]"20" height="20" viewBox="0 0 24 24" fill={active ? "#3b82f6" : "#94a3b8"} xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4V2H17V4H20C21.1 4 22 4.9 22 6V8C22 10.21 20.21 12 18 12H17.5C16.88 13.36 15.83 14.5 14.5 15.18V16H15C15.55 16 16 16.45 16 17V18H8V17C8 16.45 8.45 16 9 16H9.5V15.18C8.17 14.5 7.12 13.36 6.5 12H6C3.79 12 2 10.21 2 8V6C2 4.9 2.9 4 4 4H7ZM6 6H4V8C4 9.1 4.9 10 6 10V6ZM20 8V6H18V10C19.1 10 20 9.1 20 8Z"/>
    </svg>
  )
}

const BOTTOM_MENU = [
  {id:'ligat', label:'Ligat', isTrophy:true},
  {id:'live', label:'Live', icon:'🔴', live:true},
  {id:'kalendari', label:'Kalendari', icon:'📅'},
  {id:'lajme', label:'Lajme', icon:'📰'},
  {id:'favorites', label:'Favorites', icon:'⭐'},
]

export default function Home() {
  const [matches, setMatches] = useState<any[]>([])
  const [teamsMap, setTeamsMap] = useState<Record<string, any>>({})
  const [compsMap, setCompsMap] = useState<Record<string, any>>({})
  const [activeTab, setActiveTab] = useState('ligat')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchAll = async () => {
      const { data: teams } = await supabase.from("teams").select("*")
      const { data: comps } = await supabase.from("competitions").select("*")
      const tMap: any = {}; const cMap: any = {}
      teams?.forEach((t:any) => tMap[t.id] = t)
      comps?.forEach((c:any) => cMap[c.id] = c)
      setTeamsMap(tMap); setCompsMap(cMap)
      const { data: m } = await supabase.from("matches").select("*").order("match_date", {ascending:false})
      setMatches(m||[])
    }
    fetchAll()
  }, [])

  const filtered = matches.filter((m:any) => {
    if(activeTab==='live') return m.status==='live'
    if(filter==='all') return true
    return m.status===filter
  })

  const grouped: Record<string, any[]> = {}
  filtered.forEach((m:any) => {
    const comp = compsMap[m.competition_id]?.name || 'Superliga'
    if(!grouped[comp]) grouped[comp]=[]
    grouped[comp].push(m)
  })

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-">
      <header className="bg-[#1e293b] border-b border-[#334155] sticky top-0 z-50">
        <div className="max-w- mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#3b82f6] rounded-lg flex items-center justify-center font-black text-white">90</div>
            <h1 className="text- font-black">MINUTA<span className="text-[#3b82f6]">90</span>.LIVE</h1>
          </div>
          <a href="/admin" className="bg-[#334155] px-3 py-1.5 rounded-full text-">Admin</a>
        </div>
      </header>

      <main className="max-w- mx-auto">
        <div className="flex gap-2 p-4 overflow-x-auto">
          <button onClick={()=> setFilter('all')} className={`px-5 py-2.5 rounded-full text- font-bold ${filter==='all'?'bg-[#3b82f6] text-white':'bg-[#1e293b] text-slate-400'}`}>TË GJITHA</button>
          <button onClick={()=> setFilter('live')} className={`px-5 py-2.5 rounded-full text- font-bold ${filter==='live'?'bg-[#3b82f6] text-white':'bg-[#1e293b] text-slate-400'}`}>LIVE</button>
        </div>

        {Object.entries(grouped).map(([league, leagueMatches]: any)=>(
          <div key={league} className="mt-3 mx-3">
            <div className="bg-[#1e293b] px-4 py-3 flex items-center gap-2 text- font-black rounded-t-xl border border-[#334155] border-b-0">
              <TrophyIcon active={true} /> {league} <span className="ml-auto text- bg-[#334155] px-2 py-1 rounded-full">{leagueMatches.length}</span>
            </div>
            <div className="bg-[#1e293b] divide-y divide-[#334155] border border-[#334155] rounded-b-xl overflow-hidden">
              {leagueMatches.map((m:any)=>{
                const home = teamsMap[m.home_team_id] || teamsMap[m.home_club_id] || {name:'Vendas'}
                const away = teamsMap[m.away_team_id] || teamsMap[m.away_club_id] || {name:'Mysafir'}
                const isLive = m.status==='live'
                return (
                  <div key={m.id} className="px-4 py-4 flex items-center gap-4 hover:bg-[#2a3a52]">
                    <div className="w- text-">{isLive ? <span className="text-[#3b82f6] font-black">{m.minute||45}'</span> : <span className="text-slate-400">13:00</span>}</div>
                    <div className="flex-1 space-y-1"><div className="text-">{home.name}</div><div className="text-">{away.name}</div></div>
                    <div className="text-right font-black"><div>{m.home_score ?? 0}</div><div>{m.away_score ?? 0}</div></div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b]/95 backdrop-blur-xl border-t border-[#334155] z-50">
        <div className="flex justify-around max-w- mx-auto">
          {BOTTOM_MENU.map((item:any)=>{
            const isActive = activeTab===item.id
            return (
            <button key={item.id} onClick={()=> setActiveTab(item.id)} className={`flex-1 flex flex-col items-center py-3 gap-1 ${isActive?'text-[#3b82f6]':'text-slate-500'}`}>
              <span className="h- flex items-center justify-center">
                {item.isTrophy ? <TrophyIcon active={isActive} /> : <span className="text-">{item.icon}</span>}
              </span>
              <span className="text- font-bold">{item.label}</span>
              {isActive && <div className="w-6 h-0.5 bg-[#3b82f6] rounded-full"></div>}
            </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}