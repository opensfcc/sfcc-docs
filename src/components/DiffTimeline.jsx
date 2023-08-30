import { DocumentIcon, DocumentPlusIcon, DocumentMinusIcon } from '@heroicons/react/20/solid'
import { useRef, useState, createRef, useMemo } from 'react'

import { Diff } from '@/components/Diff'

// TODO: Pull the timeline of changes from the specific URI
const timeline = [
  {
    id: 1,
    content: '87 deletions',
    version: 'v23.8',
    href: '#',
    icon: DocumentMinusIcon,
    iconBackground: 'bg-red-400 dark:bg-red-500',
  },
  {
    id: 2,
    content: '324 additions',
    version: 'v23.7',
    href: '#',
    icon: DocumentPlusIcon,
    iconBackground: 'bg-green-400 dark:bg-green-500',
  },
  {
    id: 3,
    content: '123 additions and 45 deletions',
    version: 'v23.6',
    href: '#',
    icon: DocumentIcon,
    iconBackground: 'bg-orange-500 dark:bg-orange-500',
  },
  {
    id: 4,
    content: '17 additions',
    version: 'v23.5',
    href: '#',
    icon: DocumentPlusIcon,
    iconBackground: 'bg-green-400 dark:bg-green-500',
  },
  {
    id: 5,
    content: '45 additions and 678 deletions',
    version: 'v23.4',
    href: '#',
    icon: DocumentIcon,
    iconBackground: 'bg-orange-500 dark:bg-orange-500',
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function DiffTimeline() {
  const [show, setShow] = useState([])

  const diffRefs = useMemo(() => timeline.map(() => createRef()), [])

  const handleClick = (index) => () => {
    let newShow = [...show]
    newShow[index] = !newShow[index]
    setShow(newShow)

    // Wait for hidden element to be rendered before scrolling
    if (newShow[index]) {
      setTimeout(() => {
        diffRefs[index].current.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  return (
    <div className="mt-12 flow-root border-t border-slate-200 pt-6 dark:border-slate-800">
      <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100" id="diff-timeline">
        Change History
      </h2>
      <p className="mt-1 text-base font-light text-slate-600 dark:text-slate-400">The following changes have been made historically to this document.</p>
      <ul role="list" className="-mb-8 pt-6">
        {timeline.map((diff, diffIdx) => (
          <li key={diff.id}>
            <div className="relative pb-8">
              {diffIdx !== timeline.length - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-slate-700" aria-hidden="true" /> : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={classNames(diff.iconBackground, 'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-slate-900')}>
                    <diff.icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <a href={diff.href} title={`View Version: ${diff.version}`} className="mr-1.5 font-medium text-sky-500 hover:underline">
                        {diff.version}
                      </a>
                      {diff.content}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClick(diffIdx)}
                    className="rounded-full bg-sky-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 dark:bg-slate-600 dark:hover:bg-sky-500"
                  >
                    {show[diffIdx] ? 'Hide DIFF' : 'View DIFF'}
                  </button>
                </div>
              </div>
              {show[diffIdx] && (
                <div ref={diffRefs[diffIdx]} className="ml-4 mt-8 flex flex-shrink-0 self-center">
                  <Diff />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
