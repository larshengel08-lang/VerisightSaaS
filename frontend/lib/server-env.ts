import 'server-only'

function getRequiredServerEnv(name: string) {
  const value = process.env[name]
  if (!value || !value.trim()) {
    throw new Error(`Serverconfig ontbreekt: ${name}`)
  }
  return value.trim()
}

export function getBackendApiUrl() {
  return getRequiredServerEnv('NEXT_PUBLIC_API_URL').replace(/\/+$/, '')
}

