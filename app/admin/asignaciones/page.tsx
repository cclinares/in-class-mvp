'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Asignaciones(){
  const [asignaturas,setAsignaturas]=useState<any[]>([])
  const [profes,setProfes]=useState<any[]>([])
  const [sel,setSel]=useState({ asignatura_id:0, profesor_id:'' })

  useEffect(()=>{ load() },[])
  async function load(){
    const { data: asigs } = await supabase.from('asignaturas').select('id,nombre,cursos(nombre),profesor_id,profesor:perfiles!asignaturas_profesor_id_fkey(nombre)').order('id')
    setAsignaturas(asigs||[])
    const { data: pr } = await supabase.from('perfiles').select('id,nombre').eq('rol','profesor').order('nombre')
    setProfes(pr||[])
  }

  async function asignar(){
    if(!sel.asignatura_id || !sel.profesor_id) return
    await supabase.from('asignaturas').update({ profesor_id: sel.profesor_id }).eq('id', sel.asignatura_id)
    load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Asignar profesor a asignatura</h1>
      <div className="grid md:grid-cols-3 gap-2 max-w-3xl">
        <select className="p-2 rounded border" value={sel.asignatura_id} onChange={e=>setSel(s=>({...s,asignatura_id:Number(e.target.value)}))}>
          <option value="0">Seleccione asignatura</option>
          {asignaturas.map(a=> <option key={a.id} value={a.id}>{a.cursos?.nombre} — {a.nombre}</option>)}
        </select>
        <select className="p-2 rounded border" value={sel.profesor_id} onChange={e=>setSel(s=>({...s,profesor_id:e.target.value}))}>
          <option value="">Seleccione profesor</option>
          {profes.map(p=> <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <button onClick={asignar} className="p-2 rounded bg-blue-600 text-white">Asignar</button>
      </div>
      <ul className="mt-6 space-y-2">
        {asignaturas.map(a=> (
          <li key={a.id} className="p-2 border rounded">
            <b>{a.cursos?.nombre} — {a.nombre}</b> · Profesor: {a.profesor?.nombre || '—'}
          </li>
        ))}
      </ul>
    </div>
  )
}