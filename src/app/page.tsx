// src/app/page.tsx
'use client'
import { useEffect, useCallback } from 'react' // 1. Importar useCallback
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  // 2. Envolver a função com useCallback
  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router]) // 3. Adicionar as dependências da própria função (router)

  useEffect(() => {
    checkUser()
  }, [checkUser]) // 4. Adicionar a função memorizada às dependências do useEffect

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}