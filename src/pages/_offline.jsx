import Head from 'next/head'
import Link from 'next/link'

export default function Offline() {
  return (
    <>
      <Head>
        <title>Offline</title>
      </Head>
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="font-display text-sm font-medium text-slate-900 dark:text-white">OOPS</p>
        <h1 className="mt-3 font-display text-3xl tracking-tight text-slate-900 dark:text-white">You&apos;re Offline</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Looks like you need the internet for this page.</p>
        <Link href="/" className="mt-8 text-sm font-medium text-slate-900 dark:text-white">
          Go back home
        </Link>
      </div>
    </>
  )
}
