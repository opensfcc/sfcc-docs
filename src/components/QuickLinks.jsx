import Link from 'next/link'

import { Icon } from '@/components/Icon'

export function QuickLinks({ children }) {
  return (
    <div className="grid grid-cols-1 gap-6 my-12 not-prose sm:grid-cols-2">
      {children}
    </div>
  )
}

export function QuickLink({ title, description, href, icon }) {
  return (
    <div className="relative border group rounded-xl border-slate-200 dark:border-slate-800">
      <div className="relative p-6 overflow-hidden rounded-xl">
        <Icon icon={icon} className="w-8 h-8" />
        <h2 className="mt-4 text-base font-display text-slate-900 dark:text-white">
            {title}
        </h2>
        <p className="mt-1 text-sm text-slate-700 dark:text-slate-400">
          {description}
        </p>
      </div>
    </div>
  )
}
