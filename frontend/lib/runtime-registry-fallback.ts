import 'server-only'

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const FALLBACK_DIR = path.join(process.cwd(), 'data', 'runtime-registries')

export function isMissingSchemaError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'PGRST205'
}

export async function readFallbackRegistryFile<T>(fileName: string, defaultValue: T): Promise<T> {
  try {
    const source = await readFile(path.join(FALLBACK_DIR, fileName), 'utf8')
    return JSON.parse(source) as T
  } catch {
    return defaultValue
  }
}

export async function writeFallbackRegistryFile<T>(fileName: string, value: T) {
  await mkdir(FALLBACK_DIR, { recursive: true })
  await writeFile(path.join(FALLBACK_DIR, fileName), JSON.stringify(value, null, 2), 'utf8')
}
