'use client';
import {useEffect,useMemo,useState} from 'react';
import initialPlayers from '../data/players.json';

type Player=typeof initialPlayers[number];
type Team={name:string;players:string[];starting:string[];budget:number;total:number};
type Auction={playerId:string;bid:number;ends:number;bidder:string|null};

function shuffle<T>(a:T[]){return [...a].sort(()=>Math.random()-.5)}
function makeTeam(name:string, players:Player[]):Team{
 const pool=shuffle(players);
 const chosen=[
  ...pool.filter(p=>p.position==='POR').slice(0,2),
  ...pool.filter(p=>p.position==='DEF').slice(0,5),
  ...pool.filter(p=>p.position==='MED').slice(0,5),
  ...pool.filter(p=>p.position==='DEL').slice(0,4)
 ];
 return {name,players:chosen.map(p=>p.id),starting:[],budget:150,total:0};
}
export default function Home(){
 const [players,setPlayers]=useState<Player[]>(initialPlayers);
 const [team,setTeam]=useState<Team|null>(null);
 const [tab,setTab]=useState('equipo');
 const [auctions,setAuctions]=useState<Auction[]>([]);
 const [admin,setAdmin]=useState(false);
 const [name,setName]=useState('');
 const [bid,setBid]=useState<Record<string,string>>({});
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);
 useEffect(()=>{const raw=localStorage.getItem('fantasy-team'); if(raw)setTeam(JSON.parse(raw)); const a=localStorage.getItem('fantasy-auctions');if(a)setAuctions(JSON.parse(a));},[]);
 useEffect(()=>{if(team)localStorage.setItem('fantasy-team',JSON.stringify(team))},[team]);
 useEffect(()=>localStorage.setItem('fantasy-auctions',JSON.stringify(auctions)),[auctions]);
 const byId=(id:string)=>players.find(p=>p.id===id)!;
 const totalStarting=useMemo(()=>team?team.starting.reduce((s,id)=>s+(byId(id)?.points||0),0):0,[team,players]);
 function create(){if(!name.trim())return;setTeam(makeTeam(name.trim(),players))}
 function toggle(id:string){
  if(!team)return;
  if(team.starting.includes(id))setTeam({...team,starting:team.starting.filter(x=>x!==id)});
  else if(team.starting.length<11)setTeam({...team,starting:[...team.starting,id]});
 }
 function reset(){localStorage.removeItem('fantasy-team');setTeam(null)}
 function addAuction(p:Player){setAuctions([...auctions.filter(a=>a.playerId!==p.id),{playerId:p.id,bid:p.price,ends:Date.now()+60000,bidder:null}]);}
 function placeBid(a:Auction){
  const n=Number(bid[a.playerId]);if(!team||!n||n<=a.bid||n>team.budget)return;
  setAuctions(auctions.map(x=>x.playerId===a.playerId?{...x,bid:n,bidder:team.name}:x));
 }
 if(!team)return <main className="container"><div className="hero"><h1 className="title">⚽ Fantasy LaLiga</h1><p>Tu liga privada de LaLiga EA Sports.</p></div><div className="card"><h2>Crea tu equipo</h2><p className="muted">Recibirás una plantilla aleatoria. Después tendrás que elegir tu 11 titular.</p><input className="input" placeholder="Nombre de tu equipo" value={name} onChange={e=>setName(e.target.value)}/><br/><br/><button className="btn primary" onClick={create}>Crear equipo y plantilla aleatoria</button></div></main>;
 return <main className="container">
 <header className="top"><div className="brand">⚽ Fantasy LaLiga</div><nav className="nav">{[['equipo','Mi equipo'],['mercado','Mercado'],['subastas','Subastas'],['clasificacion','Clasificación']].map(x=><button className={'btn '+(tab===x[0]?'primary':'')} onClick={()=>setTab(x[0])} key={x[0]}>{x[1]}</button>)}<button className="btn" onClick={()=>setAdmin(!admin)}>👑 Admin</button></nav></header>
 {tab==='equipo'&&<><div className="hero"><h1 className="title">{team.name}</h1><p>Presupuesto: <b>{team.budget}M</b> · Titulares: <b>{team.starting.length}/11</b> · Jornada: <b>{totalStarting} pts</b></p>{team.starting.length!==11&&<p>⚠️ Debes seleccionar exactamente 11 titulares para puntuar.</p>}</div><div className="card"><h2>Mi plantilla</h2><div className="grid">{team.players.map(id=>{const p=byId(id);return <div className={'player '+(team.starting.includes(id)?'selected':'')} key={id}><img src={p.photo}/><div className="pbody"><b>{p.name}</b><div className="muted">{p.position} · {p.club}</div><p>{p.points} pts · {p.price}M</p><button className="btn primary" onClick={()=>toggle(id)}>{team.starting.includes(id)?'Quitar del 11':'Poner en el 11'}</button></div></div>})}</div></div></>}
 {tab==='mercado'&&<div className="card"><h2>🛒 Mercado</h2><p className="muted">Jugadores de LaLiga disponibles para próximas incorporaciones.</p><div className="grid">{players.map(p=><div className="player" key={p.id}><img src={p.photo}/><div className="pbody"><b>{p.name}</b><div className="muted">{p.position} · {p.club}</div><p>{p.price}M · {p.points} pts</p></div></div>)}</div></div>}
 {tab==='subastas'&&<div className="card"><h2>🔨 Subastas</h2>{auctions.filter(a=>a.ends>now).length===0?<p className="muted">No hay subastas activas.</p>:auctions.filter(a=>a.ends>now).map(a=>{const p=byId(a.playerId);return <div className="card" key={a.playerId}><div className="row"><div><b>{p.name}</b><div className="muted">{p.club} · {p.position}</div></div><b>{Math.ceil((a.ends-now)/1000)}s</b></div><p>Puja actual: <b>{a.bid}M</b></p><input className="input" placeholder={`Más de ${a.bid}M`} value={bid[a.playerId]||''} onChange={e=>setBid({...bid,[a.playerId]:e.target.value})}/><br/><br/><button className="btn primary" onClick={()=>placeBid(a)}>Pujar</button></div>})}</div>}
 {tab==='clasificacion'&&<div className="card"><h2>🏆 Clasificación</h2><table className="table"><thead><tr><th>#</th><th>Equipo</th><th>Jornada</th><th>Total</th></tr></thead><tbody><tr><td>1</td><td>{team.name}</td><td>{team.starting.length===11?totalStarting:0}</td><td>{team.total+totalStarting}</td></tr></tbody></table></div>}
 {admin&&<div className="card admin"><h2>👑 Panel de administrador</h2><p className="muted">Prototipo: modifica puntos y crea subastas. En la versión online estos cambios se guardarán en Supabase.</p><div className="grid">{players.map(p=><div className="card" key={p.id}><b>{p.name}</b><p className="muted">{p.club} · {p.position}</p><input className="input" type="number" value={p.points} onChange={e=>setPlayers(players.map(x=>x.id===p.id?{...x,points:Number(e.target.value)}:x))}/><br/><br/><button className="btn primary" onClick={()=>addAuction(p)}>Abrir subasta 60s</button></div>)}</div><button className="btn danger" onClick={reset}>Borrar mi equipo</button></div>}
 </main>
}
