import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function readEnvFileValue(key: string): string | undefined {
  const candidates = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env.local'),
    path.resolve(process.cwd(), '..', '.env'),
  ]

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) {
      continue
    }

    const content = fs.readFileSync(filePath, 'utf8')
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#') || !line.includes('=')) {
        continue
      }

      const [rawKey, ...rest] = line.split('=')
      if (rawKey.trim() !== key) {
        continue
      }

      return rest.join('=').trim().replace(/^"(.*)"$/, '$1')
    }
  }

  return undefined
}

function getEnvValue(key: string) {
  return process.env[key] ?? readEnvFileValue(key)
}

export function createAdminClient() {
  const url = getEnvValue('NEXT_PUBLIC_SUPABASE_URL') ?? getEnvValue('SUPABASE_URL')
  const serviceRoleKey = getEnvValue('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !serviceRoleKey) {
    throw new Error('Klanttoegang is nog niet geconfigureerd: SUPABASE_SERVICE_ROLE_KEY of SUPABASE_URL ontbreekt.')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
