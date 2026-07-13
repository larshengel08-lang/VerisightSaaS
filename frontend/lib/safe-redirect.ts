// Voorkomt open-redirects: een `next`/`redirect`-parameter mag alleen naar een
// same-origin pad wijzen. Een enkele leading slash is oké, maar `//host` (protocol-
// relatief) en `/\host` (backslash-truc) escapen naar een externe origin en worden
// daarom afgewezen ten gunste van de fallback.
export function safeInternalPath(
  next: string | null | undefined,
  fallback = '/',
): string {
  if (typeof next !== 'string' || next.length === 0) return fallback
  if (!next.startsWith('/')) return fallback
  if (next.startsWith('//') || next.startsWith('/\\')) return fallback
  return next
}
