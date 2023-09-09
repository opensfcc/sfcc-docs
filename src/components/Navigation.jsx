import clsx from 'clsx'
import Highlighter from 'react-highlight-words'
import Link from 'next/link'

import { ChevronRightIcon, ArrowSmallRightIcon } from '@heroicons/react/20/solid'
import { Disclosure, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function HighlightQuery({ text, query }) {
  return <Highlighter highlightClassName="group-aria-selected:underline bg-transparent text-inherit underline underline-offset-3" searchWords={[query]} autoEscape={true} textToHighlight={text} />
}

export function Navigation({ navigation, className }) {
  let router = useRouter()

  let [modifierKey, setModifierKey] = useState()

  useEffect(() => {
    setModifierKey(/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? '⌘' : 'Ctrl ')
  }, [])

  const useFocus = () => {
    const htmlElRef = useRef(null)
    const setFocus = () => {
      htmlElRef.current && htmlElRef.current.focus()
    }

    return [htmlElRef, setFocus]
  }

  const [filteredNavigation, setFilteredNavigation] = useState(navigation)
  const [inputRef, setInputFocus] = useFocus()

  let [initialOpen, setInitialOpen] = useState(true)

  // Handle some DOM specific stuff we need to support with the navigation
  useEffect(() => {
    let timeout = null

    // Handle COMMAND + G to focus the search input
    function onKeyDown(event) {
      setInitialOpen(false)
      if (event.key === 'g' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setInputFocus()
      }
    }

    // Automatically scroll to the active link when the page loads
    function scrollToOpenMenu() {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        const activeLink = document.getElementById('current-nav-link')
        if (activeLink) {
          activeLink.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' })
        }
      }, 500)
      setInitialOpen(true)
    }

    // Add event listeners
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('load', scrollToOpenMenu)
    window.addEventListener('popstate', scrollToOpenMenu)

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('load', scrollToOpenMenu)
      window.removeEventListener('popstate', scrollToOpenMenu)
    }
  }, [setInputFocus])

  // Handle the panel open state
  const shouldPanelOpen = (open, section, link, pathname, keyword) => {
    const isSearching = keyword && keyword !== '' ? true : false
    const shouldOpen = open || isSearching || isCurrentLink(section, link, pathname)

    return !initialOpen ? open : shouldOpen
  }

  // Check if the current link is the active link
  const isCurrentLink = (section, link, pathname) => {
    const splitPath = pathname.split('/')
    const isDeprecated = splitPath[1] === 'deprecated'
    const sectionName = isDeprecated ? splitPath[2] : splitPath[1]
    const linkName = isDeprecated ? splitPath[3] : splitPath[2]

    const sectionMatch = sectionName === section.toLowerCase().replace(/\s/g, '')
    const linkMatch = linkName === link.toLowerCase().replace(/\s/g, '-')

    return sectionMatch && linkMatch
  }

  // Filter the navigation by keyword
  const filterByKeyword = () => {
    setInitialOpen(true)

    const keyword = inputRef?.current?.value

    if (!keyword) {
      setInitialOpen(false)
      setFilteredNavigation(navigation)
      return
    }

    setFilteredNavigation(() => {
      // Deep copy the navigation object
      const copy = JSON.parse(JSON.stringify(navigation))

      // Remove empty items from the array
      const purgeEmpty = (elm) => {
        return elm != null && elm !== false && elm !== ''
      }

      // Filter our copy of the navigation object by keyword
      copy.forEach((item, index) => {
        // Remove links that don't match the keyword
        item.links.forEach((_, linkIndex) => {
          // Replace children with a filtered version
          item.links[linkIndex].children = item.links[linkIndex].children.filter((child) => child.alt.toLowerCase().includes(keyword.toLowerCase()))

          // Delete the link if it has no children
          if (item.links[linkIndex].children.length === 0) {
            delete item.links[linkIndex]
          }
        })

        // Remove empty items from the array
        item.links = item.links.filter(purgeEmpty)

        // Delete the section if it has no links
        if (item.links.length === 0) {
          delete copy[index]
        }
      })

      // Last pass to remove empty results in parent
      return copy.filter(purgeEmpty)
    })
  }

  return (
    <nav className={clsx('relative lg:text-sm lg:leading-6', className)}>
      <div className="under pointer-events-none sticky top-0 z-10 ml-0.5">
        <div className="h-10 bg-slate-50 dark:bg-slate-900"></div>
        <div className="pointer-events-auto relative bg-slate-50 dark:bg-slate-900">
          <div className="relative rounded-md text-slate-400 shadow-sm">
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
              maxLength={20}
              spellCheck="false"
              onInput={filterByKeyword}
              className="dark:highlight-white/5 w-full items-center rounded-md py-1.5 pl-11 pr-3 text-sm leading-6 text-slate-400 shadow-sm ring-1 ring-slate-900/10 hover:ring-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 lg:flex"
              placeholder="Menu filter.."
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center pr-3 md:flex">
              <span className="ml-auto flex-none pl-3 text-xs font-semibold">{modifierKey}G</span>
            </div>
          </div>
        </div>
        <div className="h-8 bg-gradient-to-b from-slate-50 dark:from-slate-900"></div>
      </div>
      <ul role="list" className="z-0 ml-0.5 space-y-9">
        {filteredNavigation.length === 0 && <li className="text-slate-500">No results found.</li>}
        {filteredNavigation.length > 0 &&
          filteredNavigation.map((section) => (
            <li key={section.title}>
              <h2 className="font-display font-medium text-slate-900 dark:text-white">
                <HighlightQuery text={section.title} query={inputRef?.current?.value || null} />
              </h2>
              <ul role="list" className="mt-2 space-y-0 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:space-y-0 lg:border-slate-200">
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
                          <HighlightQuery text={link.title} query={inputRef?.current?.value || null} />
                        </Link>
                      ) : (
                        <Disclosure as="div">
                          {({ open }) => (
                            <>
                              <Disclosure.Button
                                title={link.alt}
                                onClick={() => setInitialOpen(false)}
                                className={clsx(
                                  'm-0 flex w-full rounded-r-md py-2 pl-3.5 pr-2 font-medium before:pointer-events-none before:absolute before:-left-0.5 before:top-5 before:h-10 before:w-0.5 before:-translate-y-1/2 hover:before:bg-sky-500/40',
                                  shouldPanelOpen(open, section.title, link.title, router.pathname, inputRef?.current?.value)
                                    ? 'bg-slate-100 font-semibold text-sky-500 before:bg-sky-400 dark:bg-slate-950/30 dark:before:bg-sky-500'
                                    : 'text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
                                )}
                              >
                                <HighlightQuery text={link.title} query={inputRef?.current?.value || null} />
                                <ChevronRightIcon
                                  className={classNames(
                                    shouldPanelOpen(open, section.title, link.title, router.pathname, inputRef?.current?.value) ? 'sky-500 rotate-90 transform' : 'text-gray-400',
                                    'relative top-0.5 ml-auto h-5 w-5 shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                              </Disclosure.Button>
                              <Transition
                                show={shouldPanelOpen(open, section.title, link.title, router.pathname, inputRef?.current?.value)}
                                enter="transition duration-50 ease-out"
                                enterFrom="transform -translate-x-full opacity-0"
                                enterTo="transform translate-x-0 opacity-100"
                                leave="transition duration-15 ease-out"
                                leaveFrom="transform translate-x-0 opacity-100"
                                leaveTo="transform -translate-x-full opacity-0"
                              >
                                <Disclosure.Panel as="ul" role="list" className="mb-4 mt-4 space-y-3 border-slate-100 dark:border-slate-800 lg:border-slate-200">
                                  {link?.children &&
                                    link.children.map((child, index) => (
                                      <li key={child.href} className="relative">
                                        <Link
                                          href={child.href}
                                          title={child.alt}
                                          id={isCurrentLink(section.title, link.title, router.pathname) ? 'current-nav-link' : `nav-link-${index}`}
                                          className={clsx(
                                            'block w-full truncate pl-3 text-xs before:pointer-events-none before:absolute before:-left-0 before:top-1/2 before:h-1.5 before:w-0.5 before:-translate-y-1/2 before:rounded-full',
                                            child.href === router.pathname
                                              ? 'font-semibold text-sky-500 before:-left-0.5 before:top-2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:bg-sky-400/80 dark:before:bg-sky-500/80'
                                              : 'text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
                                          )}
                                        >
                                          <span className="flex-nowrap">
                                            <ArrowSmallRightIcon className="mr-2 inline-block h-3 w-3 shrink-0 text-xs" aria-hidden="true" />
                                            <HighlightQuery text={child.title} query={inputRef?.current?.value || null} />
                                          </span>
                                        </Link>
                                      </li>
                                    ))}
                                </Disclosure.Panel>
                              </Transition>
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
