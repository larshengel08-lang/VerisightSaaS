import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type AcceptanceFixture = {
  fixture?: {
    email?: string
    password?: string
  }
}

type QaPersona = 'hr' | 'admin'

function isLocalDevRequest(request: NextRequest) {
  const hostname = request.nextUrl.hostname
  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1'

  return process.env.NODE_ENV === 'development' && isLocalhost
}

function getLocalhostRedirectUrl(request: NextRequest) {
  const hostname = request.nextUrl.hostname

  if (hostname === 'localhost') {
    return null
  }

  const redirectUrl = request.nextUrl.clone()
  redirectUrl.hostname = 'localhost'
  return redirectUrl
}

async function getQaCredentials() {
  const envEmail = process.env.PLAYWRIGHT_GUIDED_SELF_SERVE_EMAIL
  const envPassword = process.env.PLAYWRIGHT_GUIDED_SELF_SERVE_PASSWORD

  if (envEmail && envPassword) {
    return { email: envEmail, password: envPassword }
  }

  const runtimePath = path.resolve(
    process.cwd(),
    '..',
    '.acceptance-runtime',
    'guided-self-serve.json',
  )

  const runtimeJson = await readFile(runtimePath, 'utf-8')
  const runtimeConfig = JSON.parse(runtimeJson) as AcceptanceFixture
  const email = runtimeConfig.fixture?.email
  const password = runtimeConfig.fixture?.password

  if (!email || !password) {
    throw new Error('QA login fixture ontbreekt')
  }

  return { email, password }
}

function getSafeNextPath(request: NextRequest) {
  const requestedNext = request.nextUrl.searchParams.get('next')

  if (!requestedNext || !requestedNext.startsWith('/')) {
    return '/dashboard'
  }

  return requestedNext
}

function getRequestedPersona(request: NextRequest): QaPersona {
  const persona = request.nextUrl.searchParams.get('persona')
  return persona === 'admin' ? 'admin' : 'hr'
}

async function syncQaPersona(userId: string, persona: QaPersona) {
  const admin = createAdminClient()
  const isAdmin = persona === 'admin'

  const { error } = await admin
    .from('profiles')
    .update({ is_verisight_admin: isAdmin })
    .eq('id', userId)

  if (error) {
    throw new Error(`QA persona sync mislukt: ${error.message}`)
  }
}

export async function GET(request: NextRequest) {
  if (!isLocalDevRequest(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const localhostRedirectUrl = getLocalhostRedirectUrl(request)
  if (localhostRedirectUrl) {
    return NextResponse.redirect(localhostRedirectUrl)
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase configuratie ontbreekt' },
      { status: 500 },
    )
  }

  const targetPath = getSafeNextPath(request)
  const persona = getRequestedPersona(request)
  const response = NextResponse.redirect(new URL(targetPath, request.url))

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
      },
    },
  })

  const { email, password } = await getQaCredentials()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json(
      { error: 'QA login mislukt', detail: error.message },
      { status: 500 },
    )
  }

  const userId = data.user?.id

  if (!userId) {
    return NextResponse.json(
      { error: 'QA login gaf geen gebruiker terug' },
      { status: 500 },
    )
  }

  await syncQaPersona(userId, persona)

  return response
}
