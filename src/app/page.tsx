"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
// TEMPLATE 3 - SOFASCORE DARK BLUE
const BOTTOM_MENU = [
  {id:'ligat', label:'Ligat', iconUrl:'/icons/trophy-white.png', activeIconUrl:'/icons/trophy-blue.png'},
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
    if(item.iconUrl){
      return <img src={isActive && item.activeIconUrl ? item.activeIconUrl : item.iconUrl} className="w-[22px] h-[22px] object-contain" alt={item.label} />
    }
    return <span className="text-[20px] leading-none">{item.icon}</span>
  }
  return (
    <div className="min-h-screen bg-[#0f172a] text-white pb-[75px] md:pb-0">
      {/* HEADER - SOFASCORE BLUE STYLE */}
      <header className="bg-[#1e293b] border-b border-[#334155] sticky top-0 z-50">
        <div className="max-w-[900px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3b82f6] rounded-lg flex items-center justify-center font-black text-white text-sm">90</div>
            <h1 className="text-[18px] font-black tracking-tight">MINUTA<span className="text-[#3b82f6]">90</span>.LIVE</h1>
            <span className="ml-2 text-[10px] bg-[#3b82f6]/20 text-[#3b82f6] px-2 py-1 rounded-full font-bold">SOFASCORE</span>
          </div>
          <a href="/admin" className="bg-[#334155] hover:bg-[#475569] px-3 py-1.5 rounded-full text-[11px]">Admin</a>
        </div>
      </header>
      <main className="max-w-[900px] mx-auto">
        {activeTab==='ligat' && (
          <>
            {/* FILTERS - BLUE */}
            <div className="flex gap-2 p-4 overflow-x-auto">
              {[
                {id:'all', label:'TË GJITHA'},
                {id:'live', label:'LIVE', dot:true},
                {id:'scheduled', label:'NESËR'},
                {id:'finished', label:'PËRFUNDUAR'},
              ].map(tab=>(
                <button key={tab.id} onClick={()=> setFilter(tab.id as any)} className={`px-5 py-2.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition ${filter===tab.id?'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20':'bg-[#1e293b] text-slate-400 hover:bg-[#334155]'}`}>
                  {tab.dot && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                  {tab.label}
                </button>
              ))}
            </div>
            {Object.entries(grouped).map(([league, leagueMatches])=>(
              <div key={league} className="mt-3 mx-3">
                <div className="bg-[#1e293b] px-4 py-3 flex items-center gap-2 text-[12px] font-black text-white rounded-t-xl border border-[#334155] border-b-0">
                  <div className="w-6 h-6 bg-[#3b82f6] rounded-full flex items-center justify-center text-[10px]">🏆</div>
                  {league} 
                  <span className="ml-auto text-[10px] bg-[#334155] px-2.5 py-1 rounded-full">{leagueMatches.length} ndeshje</span>
                </div>
                <div className="bg-[#1e293b] divide-y divide-[#334155] border border-[#334155] rounded-b-xl overflow-hidden">
                  {leagueMatches.map((m:any)=>{
                    const home = teamsMap[m.home_team_id] || teamsMap[m.home_club_id] || {name:m.home_team||'Vendas', logo_url:null}
                    const away = teamsMap[m.away_team_id] || teamsMap[m.away_club_id] || {name:m.away_team||'Mysafir', logo_url:null}
                    const isLive = m.status==='live'
                    return (
                      <div key={m.id} className="px-4 py-4 flex items-center gap-4 hover:bg-[#2a3a52] cursor-pointer group transition">
                        <div className="w-[55px] text-[11px] font-mono">
                          {isLive ? <span className="text-[#3b82f6] font-black animate-pulse text-[13px]">{m.minute||45}'</span> : <span className="text-slate-400">{m.match_date ? new Date(m.match_date).toLocaleTimeString('sq-AL',{hour:'2-digit',minute:'2-digit'}) : '13:00'}</span>}
                          <div className={`text-[9px] mt-1 font-bold px-1.5 py-0.5 rounded w-fit ${isLive?'bg-[#3b82f6]/20 text-[#3b82f6]':'bg-[#334155] text-slate-500'}`}>{isLive?'LIVE':'SCH'}</div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3"><img src={home.logo_url || 'https://via.placeholder.com/20'} className="w-6 h-6 rounded-full bg-[#334155]" /><span className="text-[14px] font-medium">{home.name}</span></div>
                          <div className="flex items-center gap-3"><img src={away.logo_url || 'https://via.placeholder.com/20'} className="w-6 h-6 rounded-full bg-[#334155]" /><span className="text-[14px] font-medium">{away.name}</span></div>
                        </div>
                        <div className="text-right min-w-[50px]">
                          <div className={`text-[16px] font-black tabular-nums ${isLive?'text-[#3b82f6]':'text-white'}`}>{m.home_score ?? 0}</div>
                          <div className={`text-[16px] font-black tabular-nums ${isLive?'text-[#3b82f6]':'text-white'}`}>{m.away_score ?? 0}</div>
                        </div>
                        <div className="text-slate-500 group-hover:text-white">›</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {filtered.length===0 && <div className="mt-20 text-center text-slate-500 text-sm">Nuk ka ndeshje për këtë filter</div>}
          </>
        )}
        {activeTab==='live' && (<div className="p-4"><h2 className="font-black text-xl flex items-center gap-3"><span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span> Ndeshjet LIVE - SofaScore Style</h2><div className="mt-6 bg-[#1e293b] rounded-xl divide-y divide-[#334155] border border-[#334155]">{matches.filter(m=>m.status==='live').map((m:any)=>{const home=teamsMap[m.home_team_id]||teamsMap[m.home_club_id];const away=teamsMap[m.away_team_id]||teamsMap[m.away_club_id];return <div key={m.id} className="p-5 flex justify-between"><span>{home?.name} vs {away?.name}</span><span className="font-black text-[#3b82f6]">{m.home_score}-{m.away_score} {m.minute}'</span></div>})}{matches.filter(m=>m.status==='live').length===0 && <div className="p-12 text-center text-slate-500">Nuk ka LIVE</div>}</div></div>)}
        {activeTab==='kalendari' && (<div className="p-4"><h2 className="font-black text-xl">📅 Kalendari</h2><div className="mt-6 grid grid-cols-7 gap-2 text-center">{['Hë','Ma','Më','En','Pr','Sh','Di'].map(d=><div key={d} className="text-[11px] text-slate-500 py-2 font-bold">{d}</div>)}{Array.from({length:31},(_,i)=><div key={i} className={`py-3 rounded-xl text-[13px] font-bold cursor-pointer ${i===16?'bg-[#3b82f6] text-white shadow-lg':'bg-[#1e293b] hover:bg-[#334155] text-slate-300'}`}>{i+1}</div>)}</div></div>)}
        {activeTab==='lajme' && (<div className="p-4"><h2 className="font-black text-xl">📰 Lajme</h2><div className="mt-6 space-y-3"><div className="bg-[#1e293b] p-5 rounded-xl border border-[#334155]"><div className="text-[10px] bg-[#3b82f6]/20 text-[#3b82f6] px-2 py-1 rounded-full w-fit mb-2 font-bold">SUPERLIGA</div><div className="font-bold">Gjilani fiton derbin ndaj Dritës</div><div className="text-[11px] text-slate-500 mt-2">2h më parë</div></div></div></div>)}
        {activeTab==='favorites' && (<div className="p-4"><h2 className="font-black text-xl">⭐ Favorites</h2><div className="mt-16 text-center text-slate-500"><div className="text-6xl mb-4">⭐</div><div className="font-bold">Nuk ke ekipe favorite</div></div></div>)}
      </main>
      {/* FOOTER MENU - BLUE */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b]/95 backdrop-blur-xl border-t border-[#334155] z-50 md:hidden">
        <div className="flex justify-around max-w-[900px] mx-auto">
          {BOTTOM_MENU.map(item=>{
            const isActive = activeTab===item.id
            return (
            <button key={item.id} onClick={()=> setActiveTab(item.id)} className={`flex-1 flex flex-col items-center py-3 gap-1.5 transition ${isActive?'text-[#3b82f6]':'text-slate-500'}`}>
              <span className="relative flex items-center justify-center h-[22px]">
                {renderIcon(item, isActive)}
                {item.live && <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              </span>
              <span className="text-[10px] font-bold">{item.label}</span>
              {isActive && <div className="w-6 h-0.5 bg-[#3b82f6] rounded-full mt-0.5"></div>}
            </button>
            )
          })}
        </div>
      </nav>
      <div className="hidden md:flex max-w-[900px] mx-auto mt-8 gap-2 px-4">
        {BOTTOM_MENU.map(item=>{
          const isActive = activeTab===item.id
          return <button key={item.id} onClick={()=> setActiveTab(item.id)} className={`px-6 py-3 rounded-full text-[13px] font-bold flex items-center gap-2.5 transition ${isActive?'bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20':'bg-[#1e293b] text-slate-400 hover:bg-[#334155]'}`}>{renderIcon(item, isActive)} {item.label}</button>
        })}
      </div>
      <div className="hidden md:block mt-12 border-t border-[#334155] py-6 text-center text-[11px] text-slate-500">
        © 2026 MINUTA90.LIVE • SofaScore Template • Live Score nga Kosova
      </div>
    </div>
  )
}