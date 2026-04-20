import { isPublicApiRoutePath, isPublicRoutePath } from '@/lib/public-route-access'

export type MiddlewareAuthMode = 'public_without_auth' | 'requires_supabase'

export function resolveMiddlewareAuthMode(args: {
  pathname: string
  hasSupabaseEnv: boolean
}): MiddlewareAuthMode {
  if (!args.hasSupabaseEnv && (isPublicRoutePath(args.pathname) || isPublicApiRoutePath(args.pathname))) {
    return 'public_without_auth'
  }

  return 'requires_supabase'
}
