'use client'
import { useEffect, useState } from 'react'
import Table from '@/components/Table'
import { supabase } from '@/lib/supabaseClient'

export default function CursosPage(){
  const [rows,setRows]=useState<any[]>([])
  const [nombre,setNombre]=useState('1° Medio A')
  useEffect(()=>{ load() },[])
  async function load(){
    const { data } = await supabase.from('cursos').select('id,nombre')
    setRows(data||[])
  }
  async function crear(){
    await supabase.from('cursos').insert({ nombre })
    setNombre(''); load()
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Cursos</h1>
      <div className="flex gap-2 max-w-lg">
        <input className="p-2 rounded border flex-1" placeholder="Nombre del curso" value={nombre} onChange={e=>setNombre(e.target.value)} />
        <button onClick={crear} className="p-2 rounded bg-blue-600 text-white">Crear</button>
      </div>
      <Table headers={["ID","Nombre"]} rows={rows.map(r=>[r.id,r.nombre])} />
    </div>
  )
}