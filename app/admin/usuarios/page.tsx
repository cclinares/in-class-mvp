'use client'
import { useEffect, useState } from 'react'
import Table from '@/components/Table'
import { supabase } from '@/lib/supabaseClient'
import { ROLES } from '@/lib/roles'

export default function UsuariosPage(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({ email:'', nombre:'', rol:'profesor' })
  const [msg,setMsg]=useState('')

  useEffect(()=>{ load() },[])
  async function load(){
    const { data } = await supabase.from('perfiles').select('email,nombre,rol')
    setRows(data||[])
  }
  async function crear(){
    setMsg('')
    const res = await fetch('/api/admin/create-user', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    const j = await res.json()
    if(!res.ok){ setMsg(j.error||'Error'); return }
    setMsg('Usuario creado y perfil insertado')
    setForm({ email:'', nombre:'', rol:'profesor' })
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <div className="grid md:grid-cols-3 gap-2 max-w-2xl">
        <input className="p-2 rounded border" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
        <input className="p-2 rounded border" placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} />
        <select className="p-2 rounded border" value={form.rol} onChange={e=>setForm({...form,rol:e.target.value})}>
          {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={crear} className="p-2 rounded bg-blue-600 text-white">Crear usuario</button>
        {msg && <p className="text-sm opacity-70 col-span-full">{msg}</p>}
      </div>
      <Table headers={["Email","Nombre","Rol"]} rows={rows.map(r=>[r.email,r.nombre,r.rol])} />
    </div>
  )
}