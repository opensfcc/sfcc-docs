import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { useState, useEffect, useRef } from 'react'

import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Navigation({ navigation, className }) {
  let router = useRouter()

  const useFocus = () => {
    const htmlElRef = useRef(null)
    const setFocus = () => {
      htmlElRef.current && htmlElRef.current.focus()
    }

    return [htmlElRef, setFocus]
  }

  const [filteredNavigation, setFilteredNavigation] = useState(navigation)
  const [inputRef, setInputFocus] = useFocus()

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'g' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setInputFocus()
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const filterByKeyword = (keyword) => {
    if (keyword.length < 3) {
      setFilteredNavigation(navigation)
      return
    }

    setFilteredNavigation(() => {
      const copy = JSON.parse(JSON.stringify(navigation))

      const purgeEmpty = (elm) => {
        return elm != null && elm !== false && elm !== ''
      }

      copy.forEach((item, index) => {
        item.links.forEach((_, index) => {
          item.links[index].children = item.links[index].children.filter((child) => child.alt.toLowerCase().includes(keyword.toLowerCase()))
          if (item.links[index].children.length === 0) {
            delete item.links[index]
          }
        })

        item.links = item.links.filter(purgeEmpty)

        if (item.links.length === 0) {
          delete copy[index]
        }
      })

      return copy.filter(purgeEmpty)
    })
  }

  return (
    <nav className={clsx('relative lg:text-sm lg:leading-6', className)}>
      <div className="pointer-events-none sticky top-0 z-10 ml-0.5">
        <div className="h-10 bg-white dark:bg-slate-900"></div>
        <div className="pointer-events-auto relative bg-white dark:bg-slate-900">
          <div className="relative mt-2 rounded-md text-slate-400 shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg width="24" height="24" fill="none" aria-hidden="true" className="mr-3 flex-none">
                <path d="m19 19-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></circle>
              </svg>
            </div>
            <input
              type="text"
              name="menu-filter"
              id="menu-filter"
              defaultValue=""
              ref={inputRef}
              minLength={3}
              maxLength={20}
              spellcheck="false"
              onInput={(e) => filterByKeyword(e.target.value)}
              className="dark:highlight-white/5 hidden w-full items-center rounded-md py-1.5 pl-11 pr-3 text-sm leading-6 text-slate-400 shadow-sm ring-1 ring-slate-900/10 hover:ring-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 lg:flex"
              placeholder="Menu filter.."
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="ml-auto flex-none pl-3 text-xs font-semibold">⌘G</span>
            </div>
          </div>
        </div>
        <div className="h-8 bg-gradient-to-b from-white dark:from-slate-900"></div>
      </div>
      <ul role="list" className="z-0 space-y-9">
        {filteredNavigation.length === 0 && <li className="text-slate-500">No results found.</li>}
        {filteredNavigation.length > 0 &&
          filteredNavigation.map((section) => (
            <li key={section.title}>
              <h2 className="font-display font-medium text-slate-900 dark:text-white">{section.title}</h2>
              <ul role="list" className="mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:space-y-4 lg:border-slate-200">
                {section?.links &&
                  section.links.map((link) => (
                    <li key={link.alt} className="relative">
                      {!link.children ? (
                        <Link
                          href={link.href}
                          title={link.alt}
                          className={clsx(
                            'block w-full truncate pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full',
                            link.href === router.pathname
                              ? 'font-semibold text-sky-500 before:bg-sky-500'
                              : 'text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
                          )}
                        >
                          {link.title}
                        </Link>
                      ) : (
                        <Disclosure as="div">
                          {({ open }) => (
                            <>
                              <Disclosure.Button
                                title={link.alt}
                                className={clsx(
                                  'flex w-full pl-3.5 font-medium before:pointer-events-none before:absolute before:-left-1 before:top-3.5 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full',
                                  open || link.href === router.pathname
                                    ? 'font-semibold text-sky-500 before:bg-sky-500'
                                    : 'text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
                                )}
                              >
                                {link.title}
                                <ChevronRightIcon className={classNames(open ? 'sky-500 rotate-90' : 'text-gray-400', 'relative top-0.5 ml-auto h-5 w-5 shrink-0')} aria-hidden="true" />
                              </Disclosure.Button>
                              <Disclosure.Panel as="ul" role="list" className="mt-4 space-y-9 border-slate-100 dark:border-slate-800 lg:mt-4 lg:space-y-2.5 lg:border-slate-200">
                                {link?.children &&
                                  link.children.map((child) => (
                                    <li key={child.href} className="relative">
                                      <Link
                                        href={child.href}
                                        title={child.alt}
                                        className={clsx(
                                          'block w-full truncate pl-3.5 text-xs before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full',
                                          child.href === router.pathname
                                            ? 'font-semibold text-sky-500 before:bg-sky-500'
                                            : 'text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
                                        )}
                                      >
                                        {child.title}
                                      </Link>
                                    </li>
                                  ))}
                              </Disclosure.Panel>
                              {/* </ul> */}
                            </>
                          )}
                        </Disclosure>
                      )}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
      </ul>
    </nav>
  )
}
