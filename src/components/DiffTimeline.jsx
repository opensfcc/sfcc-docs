import { DocumentIcon, DocumentPlusIcon, DocumentMinusIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'
import { useState, createRef, useMemo } from 'react'

import { DiffView } from '@/components/DiffView'
import { diffs } from '@/data/diffs'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function DiffTimeline() {
  const router = useRouter()
  const [show, setShow] = useState([])

  const curPage = router.pathname
  const diffHistory = diffs[curPage] || null

  let timeline = useMemo(() => diffHistory && diffHistory.map((change, index) => {
    let icon = DocumentIcon
    let iconBackground = 'bg-slate-400 dark:bg-slate-600'
    let content = `Modified: ${change.label}`

    if (change.status === 'added') {
      icon = DocumentPlusIcon
      iconBackground = 'bg-green-400 dark:bg-green-500'
      content = 'Document Added'
    } else if (change.status === 'deleted') {
      icon = DocumentMinusIcon
      iconBackground = 'bg-red-400 dark:bg-red-500'
      content = 'Document Deleted'
    }

    return {
      id: `${change.version}-${index + 1}`,
      status: change.status,
      file: change.file,
      content: content,
      version: change.version,
      href: '#',
      icon: icon,
      iconBackground: iconBackground,
      diff: change.diff
    }
  }), [diffHistory])


  const diffRefs = useMemo(() => timeline && timeline.map(() => createRef()), [timeline])

  const handleClick = (index) => () => {
    let newShow = [...show]
    newShow[index] = !newShow[index]
    setShow(newShow)

    // Wait for hidden element to be rendered before scrolling
    if (newShow[index]) {
      setTimeout(() => {
        diffRefs[index]?.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }

  return timeline && (
    <div className="mt-12 flow-root border-t border-slate-200 pt-6 dark:border-slate-800">
      <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100" id="diff-timeline">
        Change History
      </h2>
      <p className="mt-1 text-base font-light text-slate-600 dark:text-slate-400">The following changes have been made historically to this document.</p>
      <ul role="list" className="-mb-8 pt-6">
        {timeline.map((change, diffIdx) => (
          <li key={change.id}>
            <div className="relative pb-8">
              {diffIdx !== timeline.length - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-slate-700" aria-hidden="true" /> : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className={classNames(change.iconBackground, 'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white dark:ring-slate-900')}>
                    <change.icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <a href={change.href} title={`View version ${change.version} of this document`} className="mr-1.5 font-medium text-sky-500 hover:underline inline-block w-12">
                        v{change.version}
                      </a>
                      <span aria-hidden="true" className="mr-2">›</span> {change.content}
                    </p>
                  </div>
                  {change.status === 'modified' && <button
                    type="button"
                    onClick={handleClick(diffIdx)}
                    className="rounded-full whitespace-nowrap bg-sky-500 px-2.5 py-1 h-7 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                  >
                    {show[diffIdx] ? 'Hide DIFF' : 'View DIFF'}
                  </button>}
                </div>
              </div>
              {(change.status === 'modified' && show[diffIdx]) && (
                <div ref={diffRefs[diffIdx]} className="ml-4 mt-8 flex flex-shrink-0 self-center">
                  <DiffView file={change.file} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
