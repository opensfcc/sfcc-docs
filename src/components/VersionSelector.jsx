import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

import { currentVersion, versions } from '@/data/versions'

export function VersionSelector(props) {
  // Handle switching versions
  // TODO: This will just be a redirect to the selected version
  const versionChange = (version) => {
    console.log(`Version changed to ${version}`)
  }

  return (
    <Listbox as="div" value={currentVersion} onChange={versionChange} className="relative" {...props}>
      <Listbox.Label className="sr-only">Select Version</Listbox.Label>
      <Listbox.Button
        className="flex h-6 w-20 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold leading-5 text-white shadow-md shadow-black/5 ring-1 ring-black/5 dark:ring-inset dark:ring-white/5"
        aria-label={`v${currentVersion}`}
      >
        {`v${currentVersion}`}
        <ChevronDownIcon className="top-0.25 relative -mr-1 h-5 w-5 text-white" aria-hidden="true" />
      </Listbox.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Listbox.Options className="absolute top-full -ml-4 mt-3 max-h-60 w-28 space-y-1 overflow-scroll rounded-xl bg-white p-3 text-sm font-medium shadow-md shadow-black/5 ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/5">
          {versions.map((version) => (
            <Listbox.Option
              key={version.value}
              value={version.value}
              className={({ active, selected }) =>
                clsx('relative flex cursor-pointer select-none items-center rounded-[0.625rem] p-1', {
                  'text-sky-500': selected,
                  'text-slate-900 dark:text-white': active && !selected,
                  'text-slate-700 dark:text-slate-400': !active && !selected,
                  'bg-slate-100 dark:bg-slate-900/40': active,
                })
              }
            >
              {({ selected }) => (
                <>
                  <div className="ml-3">{version.name}</div>
                  {selected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-1 text-sky-500">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Transition>
    </Listbox>
  )
}
