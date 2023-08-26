import Head from 'next/head'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page not found - SFCC Docs</title>
      </Head>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-sm font-medium font-display text-slate-900 dark:text-white">
          404
        </p>
        <h1 className="mt-3 text-3xl tracking-tight font-display text-slate-900 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <Link
          href="/"
          className="mt-8 text-sm font-medium text-slate-900 dark:text-white"
        >
          Go back home
        </Link>
      </div>
    </>
  )
}
