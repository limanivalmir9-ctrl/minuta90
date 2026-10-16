"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Match = any
type Event = { id: string, match_id: string, type: string, minute: number, team: string, player_name: string, description: string, created_at: string }

const EVENT_TYPES = [
  { value: 'goal', label: '⚽ GOL', color: 'bg-green-500' },
  { value: 'yellow_card', label: '🟨 Karton i Verdhë', color: 'bg-yellow-500' },
  { value: 'red_card', label: '🟥 Karton i Kuq', color: 'bg-red-600' },
  { value: 'substitution', label: '🔄 Zëvendësim', color: 'bg-blue-500' },
  { value: 'penalty', label: '🎯 Penallti', color: 'bg-purple-500' },
  { value: 'own_goal', label: '😱 Autogol', color: 'bg-orange-500' },
  { value: 'comment', label: '💬 Koment', color: 'bg-zinc-600' },
]

export default function AgentPro() {
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [form, setForm] = useState({ type: 'goal', minute: 0, team: 'home', player_name: '', description: '' })

  useEffect(() => {
    supabase.from("matches").select("*").eq("status","live").order("created_at",{ascending:false}).then(r=> setMatches(r.data||[]))
  }, [])

  useEffect(() => {
    if(!selectedMatch) return
    const fetchEvents = async () => {
      const { data } = await supabase.from("match_events").select("*").eq("match_id", selectedMatch.id).order("minute", {ascending:true})
      setEvents(data||[])
    }
    fetchEvents()
    const ch = supabase.channel(`events-${selectedMatch.id}`).on('postgres_changes',{event:'*',schema:'public',table:'match_events', filter:`match_id=eq.${selectedMatch.id}`}, fetchEvents).subscribe()
    return ()=> { supabase.removeChannel(ch) }
  }, [selectedMatch])

  const addEvent = async () => {
    if(!selectedMatch) return
    // If goal, update score automatically
    if(form.type==='goal' || form.type==='penalty') {
      const isHome = form.team==='home'
      const updates: any = { minute: form.minute }
      if(isHome) updates.home_score = selectedMatch.home_score+1
      else updates.away_score = selectedMatch.away_score+1
      await supabase.from("matches").update(updates).eq("id", selectedMatch.id)
      setSelectedMatch({...selectedMatch, ...updates})
      setMatches(matches.map(m=> m.id===selectedMatch.id ? {...m, ...updates} : m))
    } else if(form.type==='own_goal') {
      const isHome = form.team==='home'
      const updates: any = { minute: form.minute }
      if(isHome) updates.away_score = selectedMatch.away_score+1
      else updates.home_score = selectedMatch.home_score+1
      await supabase.from("matches").update(updates).eq("id", selectedMatch.id)
      setSelectedMatch({...selectedMatch, ...updates})
    } else {
      await supabase.from("matches").update({ minute: form.minute }).eq("id", selectedMatch.id)
    }

    await supabase.from("match_events").insert([{ match_id: selectedMatch.id, ...form }])
    setForm({ ...form, player_name: '', description: '' })
  }

  const finishMatch = async () => {
    if(!selectedMatch) return
    await supabase.from("matches").update({ status: 'finished' }).eq("id", selectedMatch.id)
    setMatches(matches.filter(m=> m.id!==selectedMatch.id))
    setSelectedMatch(null)
    alert("Ndeshja u mbyll!")
  }

  if(!selectedMatch) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <h1 className="text-2xl font-black mb-6">AGJENTI PRO - Zgjidh Ndeshjen</h1>
        <div className="grid gap-3 max-w-2xl">
          {matches.map(m=> (
            <button key={m.id} onClick={()=> setSelectedMatch(m)} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-left hover:border-[#00ff85] flex justify-between">
              <span className="font-bold">{m.home_team} {m.home_score} - {m.away_score} {m.away_team}</span>
              <span className="text-[#00ff85]">{m.minute}' LIVE</span>
            </button>
          ))}
          {matches.length===0 && <p className="text-zinc-500">Nuk ka ndeshje LIVE. Shko te /admin per te krijuar.</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="bg-black border-b border-zinc-800 p-4 sticky top-0 z-10 flex justify-between items-center">
        <button onClick={()=> setSelectedMatch(null)} className="text-zinc-400">← Kthehu</button>
        <div className="text-center">
          <div className="font-black text-lg">{selectedMatch.home_team} {selectedMatch.home_score} - {selectedMatch.away_score} {selectedMatch.away_team}</div>
          <div className="text-xs text-[#00ff85]">{selectedMatch.minute}' LIVE</div>
        </div>
        <button onClick={finishMatch} className="bg-red-600 px-3 py-1 rounded text-sm font-bold">Mbyll Ndeshjen</button>
      </header>

      <main className="max-w-4xl mx-auto p-4 grid md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <h3 className="font-bold mb-4">Shto Ngjarje</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e=> setForm({...form, type: e.target.value})} className="bg-black border border-zinc-800 p-3 rounded-lg">
                {EVENT_TYPES.map(t=> <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select value={form.team} onChange={e=> setForm({...form, team: e.target.value})} className="bg-black border border-zinc-800 p-3 rounded-lg">
                <option value="home">{selectedMatch.home_team}</option>
                <option value="away">{selectedMatch.away_team}</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Minuta" value={form.minute} onChange={e=> setForm({...form, minute: parseInt(e.target.value)||0})} className="bg-black border border-zinc-800 p-3 rounded-lg" />
              <input placeholder="Lojtari (p.sh. Rexhepi)" value={form.player_name} onChange={e=> setForm({...form, player_name: e.target.value})} className="bg-black border border-zinc-800 p-3 rounded-lg" />
            </div>
            <input placeholder="Përshkrim (opsional)" value={form.description} onChange={e=> setForm({...form, description: e.target.value})} className="bg-black border border-zinc-800 p-3 rounded-lg w-full" />
            <button onClick={addEvent} className="w-full bg-[#00ff85] text-black font-black py-4 rounded-xl">SHTO NGJARJEN LIVE</button>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <h3 className="font-bold mb-4">Timeline LIVE ({events.length} ngjarje)</h3>
          <div className="space-y-2 max-h-[60vh] overflow-auto">
            {events.map(ev=> (
              <div key={ev.id} className="flex gap-3 p-3 bg-black rounded-lg border border-zinc-800/50">
                <span className="font-mono text-[#00ff85] font-bold">{ev.minute}'</span>
                <span className="text-sm"><b>{EVENT_TYPES.find(t=>t.value===ev.type)?.label}</b> - {ev.player_name} {ev.description && `- ${ev.description}`}</span>
              </div>
            ))}
            {events.length===0 && <p className="text-zinc-500 text-sm">Ende nuk ka ngjarje. Shto golin e parë!</p>}
          </div>
        </div>
      </main>
    </div>
  )
}