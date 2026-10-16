"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

// ============================================
// IKONAT - Ligat ka ikonën tënde të trofeut!
// ============================================
const BOTTOM_MENU = [
  {id:'ligat', label:'Ligat', iconUrl:'/icons/trophy-white.png', activeIconUrl:'/icons/trophy-green.png'},
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
      return <img src={isActive && item.activeIconUrl ? item.activeIconUrl : item.iconUrl} className="w- h- object-contain" alt={item.label} />
    }
    return <span className="text- leading-none">{item.icon}</span>
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb- md:pb-0">
      <header className="bg-[#1a1a1a] border-b border-[#2a2a2a] sticky top-0 z-50">
        <div className="max-w- mx-auto px-3 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#00ff85] rounded flex items-center justify-center font-black text-black">90</div>
            <h1 className="text- font-black tracking-tight">MINUTA<span className="text-[#00ff85]">90</span>.LIVE</h1>
          </div>
          <a href="/admin" className="bg-[#2a2a2a] px-3 py-1.5 rounded-full text-">Admin</a>
        </div>
      </header>

      <main className="max-w- mx-auto">
        {activeTab==='ligat' && (
          <>
            <div className="flex gap-1 p-3 overflow-x-auto">
              {[
                {id:'all', label:'TË GJITHA'},
                {id:'live', label:'LIVE', dot:true},
                {id:'scheduled', label:'NESËR'},
                {id:'finished', label:'PËRFUNDUAR'},
              ].map(tab=>(
                <button key={tab.id} onClick={()=> setFilter(tab.id as any)} className={`px-4 py-2 rounded-full text- font-bold flex items-center gap-1.5 whitespace-nowrap ${filter===tab.id?'bg-white text-black':'bg-[#2a2a2a] text-zinc-400'}`}>
                  {tab.dot && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                  {tab.label}
                </button>
              ))}
            </div>

            {Object.entries(grouped).map(([league, leagueMatches])=>(
              <div key={league} className="mt-2">
                <div className="bg-[#1e1e1e] px-3 py-2.5 flex items-center gap-2 text- font-bold text-zinc-300 border-y border-[#2a2a2a]">🏆 {league} <span className="ml-auto text- bg-[#2a2a2a] px-2 py-0.5 rounded-full">{leagueMatches.length}</span></div>
                <div className="bg-[#171717] divide-y divide-[#222]">
                  {leagueMatches.map((m:any)=>{
                    const home = teamsMap[m.home_team_id] || teamsMap[m.home_club_id] || {name:m.home_team||'Vendas', logo_url:null}
                    const away = teamsMap[m.away_team_id] || teamsMap[m.away_club_id] || {name:m.away_team||'Mysafir', logo_url:null}
                    const isLive = m.status==='live'
                    return (
                      <div key={m.id} className="px-3 py-3 flex items-center gap-3 hover:bg-[#1e1e1e]">
                        <div className="w- text- font-mono">{isLive ? <span className="text-[#00ff85] font-black animate-pulse">{m.minute||45}'</span> : <span className="text-zinc-500">{m.match_date ? new Date(m.match_date).toLocaleTimeString('sq-AL',{hour:'2-digit',minute:'2-digit'}) : '17:00'}</span>}<div className={`text- ${isLive?'text-[#00ff85]':'text-zinc-600'}`}>{isLive?'LIVE':(m.status||'SCH').toUpperCase()}</div></div>
                        <div className="flex-1 space-y-1.5"><div className="flex items-center gap-2"><img src={home.logo_url || 'https://via.placeholder.com/20'} className="w-5 h-5 rounded-full bg-white/5" /><span className="text-">{home.name}</span></div><div className="flex items-center gap-2"><img src={away.logo_url || 'https://via.placeholder.com/20'} className="w-5 h-5 rounded-full bg-white/5" /><span className="text-">{away.name}</span></div></div>
                        <div className="text-right min-w-"><div className={`text- font-black ${isLive?'text-[#00ff85]':'text-white'}`}>{m.home_score ?? 0}</div><div className={`text- font-black ${isLive?'text-[#00ff85]':'text-white'}`}>{m.away_score ?? 0}</div></div><div className="text-zinc-600">›</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {filtered.length===0 && <div className="mt-20 text-center text-zinc-500 text-sm">Nuk ka ndeshje</div>}
          </>
        )}

        {activeTab==='live' && (<div className="p-4"><h2 className="font-black text-lg flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span> LIVE</h2><div className="mt-4 bg-[#171717] rounded-xl divide-y divide-[#222] border border-[#222]">{matches.filter(m=>m.status==='live').map((m:any)=>{const home=teamsMap[m.home_team_id]||teamsMap[m.home_club_id];const away=teamsMap[m.away_team_id]||teamsMap[m.away_club_id];return <div key={m.id} className="p-4 flex justify-between"><span>{home?.name} vs {away?.name}</span><span className="font-black text-[#00ff85]">{m.home_score}-{m.away_score} {m.minute}'</span></div>})}{matches.filter(m=>m.status==='live').length===0 && <div className="p-12 text-center text-zinc-500 text-sm">Nuk ka LIVE</div>}</div></div>)}
        {activeTab==='kalendari' && (<div className="p-4"><h2 className="font-black text-lg">📅 Kalendari</h2><div className="mt-4 grid grid-cols-7 gap-1 text-center">{['Hë','Ma','Më','En','Pr','Sh','Di'].map(d=><div key={d} className="text- text-zinc-500 py-2">{d}</div>)}{Array.from({length:31},(_,i)=><div key={i} className={`py-3 rounded-lg text- ${i===16?'bg-[#00ff85] text-black font-black':'bg-[#1a1a1a]'}`}>{i+1}</div>)}</div></div>)}
        {activeTab==='lajme' && (<div className="p-4"><h2 className="font-black text-lg">📰 Lajme</h2><div className="mt-4 space-y-3"><div className="bg-[#171717] p-4 rounded-xl border border-[#222]"><div className="font-bold text-">Gjilani fiton derbin</div><div className="text- text-zinc-500 mt-1">2h më parë</div></div></div></div>)}
        {activeTab==='favorites' && (<div className="p-4"><h2 className="font-black text-lg">⭐ Favorites</h2><div className="mt-16 text-center text-zinc-500"><div className="text-5xl mb-4">⭐</div><div className="text-sm">Nuk ke ekipe favorite</div></div></div>)}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a]/95 backdrop-blur-lg border-t border-[#2a2a2a] z-50 md:hidden">
        <div className="flex justify-around max-w- mx-auto">
          {BOTTOM_MENU.map(item=>{
            const isActive = activeTab===item.id
            return (
            <button key={item.id} onClick={()=> setActiveTab(item.id)} className={`flex-1 flex flex-col items-center py-2.5 gap-1 ${isActive?'text-[#00ff85]':'text-zinc-500'}`}>
              <span className="relative flex items-center justify-center h-">
                {renderIcon(item, isActive)}
                {item.live && <span className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
              </span>
              <span className="text- font-bold">{item.label}</span>
              {isActive && <div className="w-5 h-0.5 bg-[#00ff85] rounded-full mt-0.5"></div>}
            </button>
            )
          })}
        </div>
      </nav>

      <div className="hidden md:flex max-w- mx-auto mt-6 gap-2 px-3">
        {BOTTOM_MENU.map(item=>{
          const isActive = activeTab===item.id
          return <button key={item.id} onClick={()=> setActiveTab(item.id)} className={`px-5 py-2.5 rounded-full text- font-bold flex items-center gap-2 ${isActive?'bg-white text-black':'bg-[#1e1e1e] text-zinc-400'}`}>{renderIcon(item, isActive)} {item.label}</button>
        })}
      </div>
    </div>
  )
}