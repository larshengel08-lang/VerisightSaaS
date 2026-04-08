import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <Link href="/" className="inline-block text-2xl font-bold text-blue-600 tracking-tight mb-10">
          Verisight
        </Link>

        {/* Icon */}
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
          🔍
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Pagina niet gevonden</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          De pagina die je zoekt bestaat niet of is verplaatst.
          Controleer de URL of ga terug naar het dashboard.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            ← Naar dashboard
          </Link>
          <a
            href="mailto:hallo@verisight.nl"
            className="bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-lg text-sm border border-gray-200 transition-colors"
          >
            Contact opnemen
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-10">
          Foutcode 404 · <Link href="/" className="hover:text-gray-600 transition-colors">Verisight</Link>
        </p>
      </div>
    </div>
  )
}
