TSX
"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
// IKONË SVG PROFESIONALE - NUK DUHEN FOTO!
const TrophyIcon = ({ active }: { active?: boolean[STRIPPED 22 bytes]"20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 5V3H5V5H3C1.9 5 1 5.9 1 7V9C1 11.21 2.79 13 5 13H5.5C6.06 14.3 6.98 15.41 8.13 16.16L8 17H7C6.45 17 6 17.45 6 18V19H18V18C18 17.45 17.55 17 17 17H16L15.87 16.16C17.02 15.41 17.94 14.3 18.5 13H19C21.21 13 23 11.21 23 9V7C23 5.9 22.1 5 21 5H19ZM5 11C3.9 11 3 10.1 3 9V7H5V11ZM19 11H19C19 11 19 11 19 11V7H21V9C21 10.1 20.1 11 19 11Z" />
  </svg>
)
const BOTTOM_MENU = [
  {id:'ligat', label:'Ligat', Icon: TrophyIcon},
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
  const filtered = matches.filter(m => {
    if(activeTab==='live') return m.status==='live'
    if(filter==='all') return true
    return m.status===filter
  })
  const grouped: Record<string, any[]> = {}
  filtered.forEach(m => {
    const comp = compsMap[m.competition_id]?.name || 'Superliga'
    if(!grouped[comp]) grouped[comp]=[]
    grouped[comp].push(m)
  })
  const renderIcon = (item:any, isActive:boolean) => {
    if(item.Icon){
      return <item.Icon active={isActive} />
    }
    return <span className="text-[18px] leading-none">{item.icon}</span>
  }
  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-[75px] md:pb-0">
      <header className="bg-[#1e293b] border-b border-[#334155] sticky top-0 z-50">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3b82f6] rounded-lg flex items-center justify-center font-black text-white text-sm">90</div>
            <h1 className="text-[18px] font-black tracking-tight">MINUTA<span className="text-[#3b82f6]">90</span>.LIVE</h1>
          </div>
          <a href="/admin" className="bg-[#334155] px-3 py-1.5 rounded-full text-[11px]">Admin</a>
        </div>
      </header>
      <main className="max-w-[900px] mx-auto">
        {activeTab==='ligat' && (
          <>
            <div className="flex gap-2 p-4 overflow-x-auto">
              {[
                {id:'all', label:'TË GJITHA'},
                {id:'live', label:'LIVE', dot:true},
                {id:'scheduled', label:'NESËR'},
                {id:'finished', label:'PËRFUNDUAR'},
              ].map(tab=>(
                <button key={tab.id} onClick={()=> setFilter(tab.id as any)} className={`px-5 py-2.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap ${filter===tab.id?'bg-[#3b82f6] text-white':'bg-[#1e293b] text-slate-400'}`}>
                  {tab.dot && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                  {tab.label}
                </button>
              ))}
            </div>
            {Object.entries(grouped).map(([league, leagueMatches])=>(
              <div key={league} className="mt-3 mx-3">
                <div className="bg-[#1e293b] px-4 py-3 flex items-center gap-2 text-[12px] font-black text-white rounded-t-xl border border-[#334155] border-b-0">
                  🏆 {league} <span className="ml-auto text-[10px] bg-[#334155] px-2.5 py-1 rounded-full">{leagueMatches.length}</span>
                </div>
                <div className="bg-[#1e293b] divide-y divide-[#334155] border border-[#334155] rounded-b-xl overflow-hidden">
                  {leagueMatches.map((m:any)=>{
                    const home = teamsMap[m.home_team_id] || teamsMap[m.home_club_id] || {name:m.home_team||'Vendas', logo_url:null}
                    const away = teamsMap[m.away_team_id] || teamsMap[m.away_club_id] || {name:m.away_team||'Mysafir', logo_url:null}
                    const isLive = m.status==='live'
                    return (
                      <div key={m.id} className="px-4 py-4 flex items-center gap-4 hover:bg-[#2a3a52] group">
                        <div className="w-[55px] text-[11px] font-mono">{isLive ? <span className="text-[#3b82f6] font-black animate-pulse text-[13px]">{m.minute||45}'</span> : <span className="text-slate-400">{m.match_date ? new Date(m.match_date).toLocaleTimeString('sq-AL',{hour:'2-digit',minute:'2-digit'}) : '13:00'}</span>}<div className={`text-[9px] mt-1 font-bold px-1.5 py-0.5 rounded w-fit ${isLive?'bg-[#3b82f6]/20 text-[#3b82f6]':'bg-[#334155] text-slate-500'}`}>{isLive?'LIVE':'SCH'}</div></div>
                        <div className="flex-1 space-y-2"><div className="flex items-center gap-3"><img src={home.logo_url || 'https://via.placeholder.com/20'} className="w-6 h-6 rounded-full bg-[#334155]" /><span className="text-[14px]">{home.name}</span></div><div className="flex items-center gap-3"><img src={away.logo_url || 'https://via.placeholder.com/20'} className="w-6 h-6 rounded-full bg-[#334155]" /><span className="text-[14px]">{away.name}</span></div></div>
                        <div className="text-right min-w-[50px]"><div className={`text-[16px] font-black ${isLive?'text-[#3b82f6]':'text-white'}`}>{m.home_score ?? 0}</div><div className={`text-[16px] font-black ${isLive?'text-[#3b82f6]':'text-white'}`}>{m.away_score ?? 0}</div></div>
                        <div className="text-slate-500 group-hover:text-white">›</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}
        {activeTab==='live' && (<div className="p-4"><h2 className="font-black text-xl flex items-center gap-3"><span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span> LIVE</h2><div className="mt-6 bg-[#1e293b] rounded-xl border border-[#334155] divide-y divide-[#334155]">{matches.filter(m=>m.status==='live').length===0 && <div className="p-12 text-center text-slate-500">Nuk ka LIVE</div>}</div></div>)}
        {activeTab==='kalendari' && (<div className="p-4"><h2 className="font-black text-xl">📅 Kalendari</h2><div className="mt-6 grid grid-cols-7 gap-2 text-center">{['Hë','Ma','Më','En','Pr','Sh','Di'].map(d=><div key={d} className="text-[11px] text-slate-500 py-2 font-bold">{d}</div>)}{Array.from({length:31},(_,i)=><div key={i} className={`py-3 rounded-xl text-[13px] font-bold ${i===16?'bg-[#3b82f6] text-white':'bg-[#1e293b] text-slate-300'}`}>{i+1}</div>)}</div></div>)}
        {activeTab==='lajme' && (<div className="p-4"><h2 className="font-black text-xl">📰 Lajme</h2></div>)}
        {activeTab==='favorites' && (<div className="p-4"><h2 className="font-black text-xl">⭐ Favorites</h2></div>)}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b]/95 backdrop-blur-xl border-t border-[#334155] z-50 md:hidden">
        <div className="flex justify-around max-w-[900px] mx-auto">
          {BOTTOM_MENU.map(item=>{
            const isActive = activeTab===item.id
            return (
            <button key={item.id} onClick={()=> setActiveTab(item.id)} className={`flex-1 flex flex-col items-center py-3 gap-1 transition ${isActive?'text-[#3b82f6]':'text-slate-500'}`}>
              <span className="h-[20px] flex items-center justify-center">
                {renderIcon(item, isActive)}
                {item.live && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block"></span>}
              </span>
              <span className="text-[10px] font-bold">{item.label}</span>
              {isActive && <div className="w-6 h-0.5 bg-[#3b82f6] rounded-full"></div>}
            </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}