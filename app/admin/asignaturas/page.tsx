'use client'
import { useEffect, useState } from 'react'
import Table from '@/components/Table'
import { supabase } from '@/lib/supabaseClient'

export default function AsignaturasPage(){
  const [rows,setRows]=useState<any[]>([])
  const [form,setForm]=useState({ nombre:'Matemática', curso_id:null as number|null })
  const [cursos,setCursos]=useState<any[]>([])
  useEffect(()=>{ load(); loadCursos() },[])
  async function load(){
    const { data } = await supabase.from('asignaturas').select('id,nombre, cursos(nombre)')
    setRows(data||[])
  }
  async function loadCursos(){
    const { data } = await supabase.from('cursos').select('id,nombre').order('nombre')
    setCursos(data||[])
  }
  async function crear(){
    if(!form.curso_id) return
    await supabase.from('asignaturas').insert(form)
    setForm({ nombre:'', curso_id:null }); load()
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Asignaturas</h1>
      <div className="grid md:grid-cols-3 gap-2 max-w-2xl">
        <input className="p-2 rounded border" placeholder="Nombre" value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} />
        <select className="p-2 rounded border" value={form.curso_id??''} onChange={e=>setForm({...form,curso_id: Number(e.target.value)})}>
          <option value="">Seleccione curso</option>
          {cursos.map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <button onClick={crear} className="p-2 rounded bg-blue-600 text-white">Crear</button>
      </div>
      <Table headers={["ID","Nombre","Curso"]} rows={rows.map((r:any)=>[r.id,r.nombre,r.cursos?.nombre])} />
    </div>
  )
}