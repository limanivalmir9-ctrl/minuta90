"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [matches, setMatches] = useState<any[]>([])
  const [teamsMap, setTeamsMap] = useState<Record<string, any>>({})
  const [compsMap, setCompsMap] = useState<Record<string, any>>({})
  const [eventsByMatch, setEventsByMatch] = useState<Record<string, any[]>>({})
  const [selectedMatch, setSelectedMatch] = useState<any|null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      // Merr ekipet dhe kompeticionet
      const { data: teams } = await supabase.from("teams").select("*")
      const { data: comps } = await supabase.from("competitions").select("*")
      const tMap: any = {}
      const cMap: any = {}
      teams?.forEach(t => tMap[t.id] = t)
      comps?.forEach(c => cMap[c.id] = c)
      setTeamsMap(tMap)
      setCompsMap(cMap)

      // Merr ndeshjet
      const { data: m } = await supabase.from("matches").select("*").order("created_at", {ascending:false})
      if(m) {
        setMatches(m)
        // Merr eventet
        for(const match of m) {
          const { data: ev } = await supabase.from("match_events").select("*").eq("match_id", match.id).order("minute",{ascending:false}).limit(5)
          setEventsByMatch(prev=> ({...prev, [match.id]: ev||[]}))
        }
      }
    }
    fetchAll()
    const ch = supabase.channel('public-matches').on('postgres_changes',{event:'*',schema:'public',table:'matches'}, fetchAll).subscribe()
    return ()=> { supabase.removeChannel(ch) }
  }, [])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="bg-black border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-black">MINUTA<span className="text-[#00ff85]">90</span>.LIVE</h1>
          <div className="flex gap-2 text-xs">
            <a href="/admin" className="bg-zinc-800 px-3 py-1 rounded-full">Admin</a>
            <a href="/agent" className="bg-[#00ff85] text-black px-3 py-1 rounded-full font-bold">Agjenti PRO</a>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
          {matches.map(match=> {
            const home = teamsMap[match.home_team_id] || teamsMap[match.home_club_id] || { name: match.home_team || 'Ekipi Vendas', logo_url: null }
            const away = teamsMap[match.away_team_id] || teamsMap[match.away_club_id] || { name: match.away_team || 'Ekipi Mysafir', logo_url: null }
            const comp = compsMap[match.competition_id]

            return (
              <div key={match.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 p-4 cursor-pointer" onClick={()=> setSelectedMatch(match)}>
                <div className="flex justify-between">
                  <div>
                    <div className="flex gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded font-mono ${match.status==='live'?'bg-[#00ff85] text-black animate-pulse':'bg-zinc-700'}`}>{match.status==='live'?`${match.minute||0}'`:match.status}</span>
                      <span className="text-zinc-500">{comp?.name || match.league || 'Superliga'}</span>
                    </div>
                    <div className="mt-2 font-bold flex items-center gap-2">
                      <img src={home.logo_url || 'https://via.placeholder.com/24'} className="w-5 h-5 rounded-full bg-white/10 object-cover" />
                      {home.name} <span className="text-zinc-500">vs</span> {away.name}
                      <img src={away.logo_url || 'https://via.placeholder.com/24'} className="w-5 h-5 rounded-full bg-white/10 object-cover" />
                    </div>
                    {eventsByMatch[match.id]?.slice(0,2).map((ev:any)=> (
                      <div key={ev.id} className="text-xs text-zinc-400 mt-1">{ev.minute}' {ev.player_name} - {ev.type}</div>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black">{match.home_score ?? 0} - {match.away_score ?? 0}</div>
                    <div className="text-xs text-[#00ff85]">{match.status==='live'?'LIVE':''}</div>
                  </div>
                </div>
              </div>
            )
          })}
          {matches.length===0 && <div className="p-12 text-center text-zinc-500">Nuk ka ndeshje. Shto te /admin</div>}
        </div>
      </main>
    </div>
  )
}