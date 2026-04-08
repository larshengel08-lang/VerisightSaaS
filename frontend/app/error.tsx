'use client'

import { useEffect } from 'react'
import Link from 'next/link'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">

        <Link href="/" className="inline-block text-2xl font-bold text-blue-600 tracking-tight mb-10">
          Verisight
        </Link>

        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          ⚠️
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Er is iets misgegaan</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Er is een onverwachte fout opgetreden. Probeer het opnieuw of neem contact op
          als het probleem aanhoudt.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Opnieuw proberen
          </button>
          <Link
            href="/dashboard"
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-lg text-sm border border-gray-200 transition-colors"
          >
            ← Naar dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs text-gray-300 mt-8 font-mono">Foutcode: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
