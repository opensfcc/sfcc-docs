import clsx from 'clsx'
import Highlighter from 'react-highlight-words'
import Link from 'next/link'

import { ChevronRightIcon, ArrowSmallRightIcon, ChevronDoubleRightIcon } from '@heroicons/react/20/solid'
import { FunnelIcon } from '@heroicons/react/24/outline'
import { Disclosure, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'

import useDebounce from '../debounce'
import { publish } from '../events'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function HighlightQuery({ text, query }) {
  return <Highlighter highlightClassName="group-aria-selected:underline bg-transparent text-inherit underline underline-offset-3" searchWords={query ? query.split(' ') : []} autoEscape={true} textToHighlight={text || ''} />
}

export function Navigation({ navigation, className }) {
  let router = useRouter()

  let [modifierKey, setModifierKey] = useState()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 150)

  const [scrollNav, setScrollNav] = useState(null)
  const debouncedScroll = useDebounce(scrollNav, 150)

  useEffect(() => {
    // Filter the navigation by keyword
    const filterByKeyword = () => {
      setInitialOpen(true)

      if (!search) {
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
            item.links[linkIndex].children = item.links[linkIndex].children.filter((child) => child.alt.toLowerCase().includes(search.toLowerCase()))

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

    if (debouncedSearch) {
      filterByKeyword()
    }
  }, [debouncedSearch, navigation, search])

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

  const [initialOpen, setInitialOpen] = useState(true)
  const [sectionOpen, setSectionOpen] = useState([false, false, false, false, false])

  const [scrollTimer, setScrollTimer] = useState(null)

  const handleSectionClick = (index) => () => {
    setInitialOpen(false)
    let newSectionOpen = [...sectionOpen]
    newSectionOpen[index] = !newSectionOpen[index]
    setSectionOpen(newSectionOpen)
  }

  // Handle some DOM specific stuff we need to support with the navigation
  useEffect(() => {
    // Handle COMMAND + G to focus the search input
    function onKeyDown(event) {
      if (event.key === 'g' && (event.metaKey || event.ctrlKey)) {
        setInitialOpen(false)
        event.preventDefault()
        setInputFocus()
      }
    }

    // Add event listeners
    window.addEventListener('keydown', onKeyDown)

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [setInputFocus])

  useEffect(() => {
    const scrollToLink = () => {
      clearTimeout(scrollTimer)
      let newSectionOpen = [...sectionOpen]
      const activeLink = document.querySelector('#main-menu a.current-nav-link')
      if (activeLink) {
        const index = activeLink.dataset.section
        if (index) {
          newSectionOpen[index] = true
          setSectionOpen(newSectionOpen)
          activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })
        }
      }
    }

    const handleLoad = (evt) => {
      clearTimeout(scrollTimer)
      setScrollTimer(setTimeout(scrollToLink, 500))
    }

    // Add event listeners
    window.addEventListener('pageshow', handleLoad)
    window.addEventListener('popstate', handleLoad)

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('pageshow', handleLoad)
      window.removeEventListener('popstate', handleLoad)
    }
  }, [router.asPath, scrollTimer, sectionOpen])

  // Handle the panel open state
  const shouldSectionOpen = (open, section, pathname, keyword) => {
    const isSearching = keyword && keyword !== '' ? true : false
    const shouldOpen = isSearching || isCurrentSection(section, pathname)

    return !initialOpen ? open : shouldOpen
  }

  // Handle the panel open state
  const shouldPanelOpen = (open, section, link, pathname, keyword) => {
    const isSearching = keyword && keyword !== '' ? true : false
    const shouldOpen = open || isSearching || isCurrentGroup(section, link, pathname)

    return !initialOpen ? open : shouldOpen
  }

  // Check if the current link is the active link
  const isCurrentSection = (section, pathname) => {
    const splitPath = pathname.split('/')
    const isDeprecated = splitPath[1] === 'deprecated'
    const sectionName = isDeprecated ? splitPath[2] : splitPath[1]

    const sectionMatch = section && sectionName === section.toLowerCase().replace(/\s/g, '')

    return sectionMatch
  }

  // Check if the current link is the active link
  const isCurrentGroup = (section, link, pathname) => {
    const splitPath = pathname.split('/')
    const isDeprecated = splitPath[1] === 'deprecated'
    const sectionName = isDeprecated ? splitPath[2] : splitPath[1]
    const linkName = isDeprecated ? splitPath[3] : splitPath[2]

    const sectionMatch = section && sectionName === section.toLowerCase().replace(/\s/g, '')
    const linkMatch = link && linkName === link.toLowerCase().replace(/\s/g, '-')

    return sectionMatch && linkMatch
  }

  return (
    <nav className={clsx('relative lg:text-sm lg:leading-6 ', className)}>
      <div className="under pointer-events-none sticky top-0 z-10 ml-0.5">
        <div className="h-10 bg-slate-50 dark:bg-slate-900"></div>
        <div className="pointer-events-auto relative bg-slate-50 dark:bg-slate-900">
          <div className="relative rounded-md text-slate-400 shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FunnelIcon className="h-5 w-5 " aria-hidden="true" />
            </div>
            <input
              type="search"
              name="menu-filter"
              id="menu-filter"
              ref={inputRef}
              maxLength={20}
              spellCheck="false"
              value={search}
              onFocus={() => {
                document.documentElement.setAttribute('data-filtering', true)
                publish('menuFiltering', { filtering: true })
              }}
              onBlur={() => {
                setTimeout(() => {
                  document.documentElement.setAttribute('data-filtering', false)
                  publish('menuFiltering', { filtering: false })
                }, 100)
              }}
              onInput={(e) => {
                const value = e.target.value
                if (!value) {
                  setInitialOpen(false)
                  setFilteredNavigation(navigation)
                }

                setSearch(e.target.value)
              }}
              className="dark:highlight-white/5 w-full items-center rounded-md py-1.5 pl-11 pr-3 text-base leading-6 text-slate-400 shadow-sm ring-1 ring-slate-900/10 hover:ring-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 lg:flex lg:text-sm"
              placeholder="Menu Filter ..."
            />
            {!inputRef?.current?.value && (
              <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center pr-3 md:flex">
                <span className="ml-auto flex-none pl-3 text-xs font-semibold">{modifierKey}G</span>
              </div>
            )}
          </div>
        </div>
        <div className="h-8 bg-gradient-to-b from-slate-50 dark:from-slate-900"></div>
      </div>
      <ul role="list" className="z-0 ml-0.5 scroll-mt-40 space-y-4">
        {filteredNavigation.length === 0 && <li className="text-slate-500">No results found.</li>}
        {filteredNavigation.length > 0 &&
          filteredNavigation.map((section, index) => (
            <li key={section.title}>
              <button
                className={classNames(shouldSectionOpen(sectionOpen[index], section.title, router.pathname, inputRef?.current?.value) ? 'text-sky-500' : 'text-slate-900 dark:text-white', 'flex w-full py-2 font-display font-medium')}
                onClick={handleSectionClick(index)}
              >
                <HighlightQuery text={section.title} query={inputRef?.current?.value || null} />
                <ChevronDoubleRightIcon
                  className={classNames(shouldSectionOpen(sectionOpen[index], section.title, router.pathname, inputRef?.current?.value) ? 'rotate-90 transform text-sky-500' : 'text-gray-400', 'relative top-0.5 ml-auto h-5 w-5 shrink-0')}
                  aria-hidden="true"
                />
              </button>
              {shouldSectionOpen(sectionOpen[index], section.title, router.pathname, inputRef?.current?.value) && (
                <ul role="list" className="mt-2 space-y-0 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:space-y-0 lg:border-slate-200">
                  {section?.links &&
                    section.links.map((link) => (
                      <li key={link.alt} className="relative">
                        <Disclosure as="div">
                          {({ open }) => (
                            <>
                              <Disclosure.Button
                                title={link.alt}
                                onClick={() => setInitialOpen(false)}
                                className={clsx(
                                  'm-0 flex w-full rounded-r-md py-2 pl-3.5 font-medium before:pointer-events-none before:absolute before:-left-0.5 before:top-5 before:h-10 before:w-0.5 before:-translate-y-1/2 hover:before:block hover:before:bg-sky-500/40',
                                  shouldPanelOpen(open, section.title, link.title, router.pathname, inputRef?.current?.value)
                                    ? 'font-bold text-sky-500 before:bg-sky-400 dark:before:bg-sky-500'
                                    : 'font-semibold text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300'
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
                                <Disclosure.Panel as="ul" role="list" className="mb-4 mt-4 space-y-2 border-slate-100 dark:border-slate-800 lg:border-slate-200">
                                  {link?.children &&
                                    link.children.map((child) => (
                                      <li key={child.href} className="relative">
                                        <Link
                                          href={child.href}
                                          title={child.alt}
                                          data-section={index}
                                          scroll={false}
                                          className={clsx(
                                            'block w-full truncate pl-3 text-sm before:pointer-events-none before:absolute before:-left-0.5 before:top-3 before:h-8 before:w-0.5 before:-translate-y-1/2 before:rounded-full',
                                            child.href === router.pathname
                                              ? 'current-nav-link font-semibold text-sky-500  before:bg-sky-400/80 dark:before:bg-sky-500/80'
                                              : `nav-link-${index} text-slate-500 before:hidden before:bg-slate-300 hover:text-slate-600 hover:before:block dark:text-slate-400 dark:before:bg-slate-700 dark:hover:text-slate-300`
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
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
      </ul>
    </nav>
  )
}
