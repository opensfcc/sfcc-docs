import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { QuestionMarkCircleIcon, LightBulbIcon, LifebuoyIcon, BugAntIcon } from '@heroicons/react/20/solid'

import clsx from 'clsx'

const issues = [
  { name: 'Ask Question', value: 'system', icon: QuestionMarkCircleIcon, style: 'h-4 w-4 text-sky-400', href: 'https://github.com/sfccdevops/sfcc-docs/issues/new?assignees=&labels=Question&projects=&template=question.yml' },
  { name: 'Report Bug', value: 'light', icon: BugAntIcon, style: 'h-4 w-4 text-green-400', href: 'https://github.com/sfccdevops/sfcc-docs/issues/new?assignees=&labels=bug%2Ctriage&projects=&template=bug-report.yml&title=%5BBug%5D%3A+' },
  {
    name: 'Request Feature',
    value: 'dark',
    icon: LightBulbIcon,
    style: 'h-4 w-4 text-yellow-400',
    href: 'https://github.com/sfccdevops/sfcc-docs/issues/new?assignees=&labels=enhancement&projects=&template=feature-request.yml&title=%5BFeature+Request+%2F+Suggestion%5D%3A+',
  },
]

export function IssueSelector(prps) {
  return (
    <Menu>
      <Menu.Button className="flex h-6 w-6 items-center justify-center rounded-lg shadow-md shadow-black/5 ring-1 ring-black/5 dark:bg-slate-700 dark:ring-inset dark:ring-white/5" aria-label="Report an Issue">
        <BugAntIcon className="h-4 w-4 fill-slate-400" />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-1/2 top-full mt-3 w-48 -translate-x-1/2 space-y-1 rounded-xl bg-white p-3 text-sm font-medium shadow-md shadow-black/5 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/5">
          {issues.map((issue) => (
            <Menu.Item key={issue.value} as={Fragment}>
              {({ active }) => (
                <a
                  className={`flex items-center rounded-[0.625rem] p-1 ${active ? 'bg-slate-100 text-slate-900 dark:bg-slate-900/40 dark:text-white' : 'text-slate-700 dark:text-slate-400 '}`}
                  href={issue.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="rounded-md bg-white p-1 shadow ring-1 ring-slate-900/5 dark:bg-slate-700 dark:ring-inset dark:ring-white/5">
                    <issue.icon className={issue.style} />
                  </div>
                  <div className="ml-3">{issue.name}</div>
                </a>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}
