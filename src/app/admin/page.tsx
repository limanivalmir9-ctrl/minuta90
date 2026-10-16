"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const MENU = [
  {id:'ballina', label:'Ballina', icon:'⊞'},
  {id:'ndeshjet-sot', label:'Ndeshjet Sot', icon:'🖥️', dot:true},
  {id:'ndeshjet', label:'Ndeshjet', icon:'📅'},
  {id:'klubet', label:'Klubet', icon:'👥'},
  {id:'stadiumet', label:'Stadiumet', icon:'📍'},
  {id:'agjentet', label:'Agjentët', icon:'🛡️'},
  {id:'kontaktet', label:'Kontaktet', icon:'✉️'},
  {id:'kompeticionet', label:'Kompeticionet', icon:'🏆'},
  {id:'yjet', label:'Yjet e Javës', icon:'⭐'},
  {id:'magazina', label:'Magazina', icon:'⚽'},
  {id:'statistikat', label:'Statistikat', icon:'📊'},
  {id:'dukshmeria', label:'Dukshmëria e Profileve', icon:'👁️'},
  {id:'transfero', label:'Transfero Klubet', icon:'➡️'},
  {id:'trofete', label:'Trofetë', icon:'🏅'},
  {id:'trajneret', label:'Trajnerët', icon:'🧑‍🏫'},
  {id:'gjyqtaret', label:'Gjyqtarët', icon:'👤'},
  {id:'tabelat', label:'Tabelat', icon:'📋'},
  {id:'golashenuesit', label:'Golashënuesit', icon:'🥅'},
  {id:'lajme', label:'Lajme', icon:'📰'},
  {id:'reklamat', label:'Reklamat', icon:'📢'},
  {id:'chat', label:'Chat Agjentë', icon:'💬'},
]

export default function AdminKS() {
  const [active, setActive] = useState('klubet')
  const [teams, setTeams] = useState<any[]>([])
  const [stadiums, setStadiums] = useState<any[]>([])
  const [competitions, setCompetitions] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null)

  // Kompeticionet form
  const [compName, setCompName] = useState('')
  const [compSeason, setCompSeason] = useState('2026/27')
  const [compTier, setCompTier] = useState(1)
  const [compLogoFile, setCompLogoFile] = useState<File|null>(null)
  const [compLogoPreview, setCompLogoPreview] = useState('')
  const [editingCompId, setEditingCompId] = useState<string|null>(null)

  // Klubet form
  const [clubName, setClubName] = useState('')
  const [clubCity, setClubCity] = useState('Gjilan')
  const [clubStadiumId, setClubStadiumId] = useState('')
  const [clubCompId, setClubCompId] = useState('')
  const [clubLogoFile, setClubLogoFile] = useState<File|null>(null)
  const [clubLogoPreview, setClubLogoPreview] = useState('')
  const [editingClubId, setEditingClubId] = useState<string|null>(null)

  const load = async () => {
    const {data:t} = await supabase.from('teams').select('*, stadiums(name), competitions(name)').order('name')
    const {data:s} = await supabase.from('stadiums').select('*').order('name')
    const {data:c} = await supabase.from('competitions').select('*').order('tier')
    const {data:m} = await supabase.from('matches').select('*').order('created_at',{ascending:false}).limit(20)
    setTeams(t||[]); setStadiums(s||[]); setCompetitions(c||[]); setMatches(m||[])
  }
  useEffect(()=>{ load() },[])

  const saveCompetition = async () => {
    if(!compName) return alert('Shkruaj emrin!')
    let logoUrl = compLogoPreview || null
    if(compLogoFile){
      try{
        const fn = `${Date.now()}-${compLogoFile.name}`
        const {error} = await supabase.storage.from('competition-logos').upload(fn, compLogoFile)
        if(!error){ const {data}=supabase.storage.from('competition-logos').getPublicUrl(fn); logoUrl=data.publicUrl }
      }catch(e){}
    }
    const payload = {name:compName, season:compSeason, tier:compTier, logo_url:logoUrl}
    const res = editingCompId? await supabase.from('competitions').update(payload).eq('id',editingCompId) : await supabase.from('competitions').insert(payload).select()
    if(res.error) alert(res.error.message)
    else { setCompName(''); setCompSeason('2026/27'); setCompTier(1); setCompLogoFile(null); setCompLogoPreview(''); setEditingCompId(null); load() }
  }
  const editComp = (c:any) => { setEditingCompId(c.id); setCompName(c.name); setCompSeason(c.season); setCompTier(c.tier); setCompLogoPreview(c.logo_url||'') }
  const deleteComp = async (id:string) => { if(!confirm('Fshij?'))return; await supabase.from('competitions').delete().eq('id',id); load() }

  const saveClub = async () => {
    if(!clubName) return alert('Emri i klubit!')
    let logoUrl = clubLogoPreview || null
    if(clubLogoFile){
      try{
        const fn = `${Date.now()}-${clubLogoFile.name}`
        const {error} = await supabase.storage.from('team-logos').upload(fn, clubLogoFile)
        if(!error){ const {data}=supabase.storage.from('team-logos').getPublicUrl(fn); logoUrl=data.publicUrl }
      }catch(e){}
    }
    // nese je brenda nje kompeticioni, perdore ate
    const finalCompId = clubCompId || (selectedCompId && selectedCompId!=='none'? selectedCompId : null)
    const payload:any = {name:clubName, short_name:clubName.slice(0,3).toUpperCase(), city:clubCity, logo_url:logoUrl, stadium_id:clubStadiumId||null, competition_id:finalCompId}
    const res = editingClubId? await supabase.from('teams').update(payload).eq('id',editingClubId) : await supabase.from('teams').insert(payload).select()
    if(res.error) alert(res.error.message)
    else { setClubName(''); setClubCity('Gjilan'); setClubStadiumId(''); setClubCompId(''); setClubLogoFile(null); setClubLogoPreview(''); setEditingClubId(null); load() }
  }
  const editClub = (t:any) => { setEditingClubId(t.id); setClubName(t.name); setClubCity(t.city||''); setClubStadiumId(t.stadium_id||''); setClubCompId(t.competition_id||''); setClubLogoPreview(t.logo_url||'') }
  const deleteClub = async (id:string) => { if(!confirm('Fshij klubin?'))return; await supabase.from('teams').delete().eq('id',id); load() }

  return (
    <div className="min-h-screen bg-[#080e1c] text-white flex overflow-hidden">
      <aside className="w- min-w- bg-[#0f172a] border-r border-white/[0.07] flex flex-col h-screen sticky top-0">
        <div className="p-3.5 border-b border-white/[0.07] flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#1e293b] rounded-md flex items-center justify-center">🛡️</div>
          <div><div className="font-black text-">KS Admin</div><div className="text- text-amber-400">⭐ Super Admin</div></div>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {MENU.map(item=> (
            <button key={item.id} onClick={()=> {setActive(item.id); setSelectedCompId(null)}} className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[12.5px] ${active===item.id?'bg-[#1e293b] text-white font-bold':'text-slate-400 hover:bg-white/[0.04]'}`}>
              <span className="flex items-center gap-2.5">{item.icon} {item.label}</span>
              {item.dot && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 bg-[#0b1222] h-screen overflow-y-auto">
        <div className="max-w- mx-auto p-5">

          {active==='kompeticionet' && (
            <>
              <div className="flex justify-between items-center mb-5">
                <h1 className="text- font-black">Kompeticionet</h1>
                <span className="text- text-slate-400">{competitions.length} kompeticione</span>
              </div>
              <div className="bg-[#151e32] rounded-xl border border-white/10 p-5 mb-6">
                <h3 className="font-bold text- mb-4">{editingCompId? 'Edito':'Shto Kompeticion'}</h3>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-4"><input value={compName} onChange={e=> setCompName(e.target.value)} placeholder="Superliga e Kosovës" className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-" /></div>
                  <div className="col-span-2"><input value={compSeason} onChange={e=> setCompSeason(e.target.value)} className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-" /></div>
                  <div className="col-span-3"><select value={compTier} onChange={e=> setCompTier(parseInt(e.target.value))} className="w-full bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-"><option value={1}>Tier 1</option><option value={2}>Tier 2</option><option value={3}>Tier 3</option><option value={4}>Tier 4 - Kupa</option></select></div>
                  <div className="col-span-3 flex gap-2"><input type="file" accept="image/*" onChange={e=>{const f=e.target.files?.[0]; if(f){setCompLogoFile(f); setCompLogoPreview(URL.createObjectURL(f))}}} className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg p-1.5 text- file:bg-white file:text-black file:border-0 file:rounded file:px-2" />{compLogoPreview && <img src={compLogoPreview} className="w-8 h-8 rounded object-cover" />}</div>
                </div>
                <button onClick={saveCompetition} className="mt-3 bg-[#00ff85] text-black font-black px-6 py-2.5 rounded-lg text-">+ SHTO</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {competitions.map(c=> (
                  <div key={c.id} className="bg-[#151e32] rounded-xl border border-white/10 p-4 flex items-center gap-3">
                    <img src={c.logo_url || 'https://via.placeholder.com/40'} className="w-12 h-12 rounded-lg bg-white/5" />
                    <div className="flex-1"><div className="font-bold text-">{c.name}</div><div className="text- text-slate-400">{c.season} • TIER {c.tier}</div></div>
                    <button onClick={()=> editComp(c)} className="w-7 h-7 bg-white/5 rounded-md">✎</button>
                    <button onClick={()=> deleteComp(c.id)} className="w-7 h-7 bg-red-500/10 text-red-400 rounded-md">🗑</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {active==='klubet' && (
            <>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  {selectedCompId && <button onClick={()=> setSelectedCompId(null)} className="w-8 h-8 bg-white/10 hover:bg-white/15 rounded-lg">←</button>}
                  <h1 className="text- font-black">{selectedCompId? competitions.find(c=>c.id===selectedCompId)?.name || 'Pa Kompeticion' : 'Klubet - Zgjidh Kompeticionin'}</h1>
                </div>
                <span className="text- text-slate-400">{selectedCompId? `${teams.filter(t=> selectedCompId==='none'?!t.competition_id : t.competition_id===selectedCompId).length} klube` : `${competitions.length} kompeticione`}</span>
              </div>

              {!selectedCompId && (
                <div className="grid grid-cols-3 gap-4">
                  {competitions.map(c=> {
                    const count = teams.filter(t=> t.competition_id===c.id).length
                    return (
                      <button key={c.id} onClick={()=> setSelectedCompId(c.id)} className="bg-[#151e32] hover:bg-[#1a2540] rounded-xl border border-white/10 p-5 text-left transition group">
                        <div className="flex justify-between"><img src={c.logo_url || 'https://via.placeholder.com/60'} className="w-14 h-14 rounded-xl bg-white/5 object-cover" /><span className="bg-amber-500/15 text-amber-400 text- px-2 py-1 rounded-full h-fit">TIER {c.tier}</span></div>
                        <div className="mt-4 font-black text-">{c.name}</div>
                        <div className="text- text-slate-400 mt-1">{c.season} • {count} klube</div>
                        <div className="mt-3 text- text-[#00ff85] font-bold">Shiko klubet →</div>
                      </button>
                    )
                  })}
                  <button onClick={()=> setSelectedCompId('none')} className="bg-[#151e32]/50 hover:bg-[#151e32] rounded-xl border border-dashed border-white/20 p-5 text-left">
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-xl">📦</div>
                    <div className="mt-4 font-bold text-">Pa Kompeticion</div>
                    <div className="text- text-slate-400 mt-1">{teams.filter(t=>!t.competition_id).length} klube</div>
                  </button>
                </div>
              )}

              {selectedCompId && (
                <>
                  <div className="bg-[#151e32] rounded-xl border border-white/10 p-4 mb-5 flex gap-2">
                    <input value={clubName} onChange={e=> setClubName(e.target.value)} placeholder="Emri klubit" className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-" />
                    <input value={clubCity} onChange={e=> setClubCity(e.target.value)} placeholder="Qyteti" className="w-24 bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-" />
                    <select value={clubStadiumId} onChange={e=> setClubStadiumId(e.target.value)} className="w-40 bg-[#0f172a] border border-white/10 rounded-lg p-2.5 text-"><option value="">Stadiumi</option>{stadiums.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                    <button onClick={saveClub} className="bg-[#00ff85] text-black font-black px-5 rounded-lg text-">+ SHTO</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {teams.filter(t=> selectedCompId==='none'?!t.competition_id : t.competition_id===selectedCompId).map(t=> (
                      <div key={t.id} className="bg-[#151e32] rounded-xl border border-white/10 p-4 flex items-center gap-3">
                        <img src={t.logo_url || 'https://via.placeholder.com/40'} className="w-12 h-12 rounded-lg bg-white/5 object-cover" />
                        <div className="flex-1"><div className="font-bold text-">{t.name}</div><div className="text- text-slate-400">{t.city} • {t.stadiums?.name || 'Pa stadium'}</div></div>
                        <button onClick={()=> editClub(t)} className="w-7 h-7 bg-white/5 rounded-md">✎</button>
                        <button onClick={()=> deleteClub(t.id)} className="w-7 h-7 bg-red-500/10 text-red-400 rounded-md">🗑</button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {active==='ballina' && <div><h1 className="text- font-black mb-4">Ballina</h1><div className="grid grid-cols-4 gap-3"><div className="bg-[#151e32] p-4 rounded-lg border border-white/10"><div className="text- text-slate-400">Kompeticione</div><div className="text-xl font-black">{competitions.length}</div></div><div className="bg-[#151e32] p-4 rounded-lg border border-white/10"><div className="text- text-slate-400">Klube</div><div className="text-xl font-black">{teams.length}</div></div></div></div>}

        </div>
      </main>
    </div>
  )
}