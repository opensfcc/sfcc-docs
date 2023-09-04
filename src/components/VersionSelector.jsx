import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'

import { publish } from '../events'

import versions from '@/data/json/versions.json'

export function VersionSelector(props) {
  let [selectedVersion, setSelectedVersion] = useState(null)

  useEffect(() => {
    if (selectedVersion) {
      document.documentElement.setAttribute('data-version', selectedVersion.value)
    } else {
      setSelectedVersion(versions.find((version) => version.value === document.documentElement.getAttribute('data-version')))
    }
    publish('versionChanged', { version: selectedVersion?.value })
  }, [selectedVersion])

  useEffect(() => {
    let handler = () => {
      setSelectedVersion(versions.find((version) => version.value === (window.localStorage.version ?? window.defaultVersion)))
    }

    window.addEventListener('storage', handler)

    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <Listbox as="div" value={selectedVersion} onChange={setSelectedVersion} className="relative" {...props}>
      <Listbox.Label className="sr-only">Select Version</Listbox.Label>
      <Listbox.Button
        className="flex h-6 w-20 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold leading-5 text-white shadow-md shadow-black/5 ring-1 ring-black/5 dark:ring-inset dark:ring-white/5"
        aria-label={selectedVersion?.name}
      >
        {selectedVersion?.name}
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
              value={version}
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
