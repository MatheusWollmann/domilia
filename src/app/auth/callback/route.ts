// src/app/auth/callback/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Pega a URL da requisição
  const requestUrl = new URL(request.url)

  // Extrai o código de autorização da URL
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // Cria um cliente Supabase para o servidor
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Troca o código pela sessão do usuário
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redireciona o usuário para o painel principal após a confirmação
  return NextResponse.redirect(requestUrl.origin + '/dashboard')
}