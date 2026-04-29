import { isPublicApiRoutePath, isPublicRoutePath } from '@/lib/public-route-access'

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

export function shouldBypassSupabaseForRequest(pathname: string) {
  return !hasSupabaseEnv() && (isPublicRoutePath(pathname) || isPublicApiRoutePath(pathname))
}
