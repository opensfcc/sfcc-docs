import Link from 'next/link'
import clsx from 'clsx'

import { DiffTimeline } from '@/components/DiffTimeline'
import { Hero } from '@/components/Hero'
import { IssueSelector } from '@/components/IssueSelector'
import { Logo, Logomark } from '@/components/Logo'
import { MobileNavigation } from '@/components/MobileNavigation'
import { Navigation } from '@/components/Navigation'
import { Prose } from '@/components/Prose'
import { Search } from '@/components/Search'
import { ThemeSelector } from '@/components/ThemeSelector'
import { VersionSelector } from '@/components/VersionSelector'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { navigation } from '@/data/navigation'
import { subscribe } from '../events'

function GitHubIcon(props) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
    </svg>
  )
}

function Header({ navigation }) {
  let router = useRouter()
  let [isScrolled, setIsScrolled] = useState(false)
  let [isMenuOpen, setMenuIsOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setIsScrolled(window.scrollY > 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Update on Route Change
  useEffect(() => {
    const codeBlocks = document.querySelectorAll('code')
    codeBlocks.forEach((block) => {
      if (block.innerText.trim().toLowerCase() === 'required') {
        block.classList.add('required')
      }
    })

    const header = document.querySelector('header h1')
    if (header && header.innerText.includes('[DEPRECATED]')) {
      header.innerHTML = header.innerHTML.replace('[DEPRECATED] ', '<span class="text-pink-400">[DEPRECATED]</span> ')
    }

    // Scroll to Anchor or Top of Page
    if (router.asPath.includes('#')) {
      const splitURL = router.asPath.split('#')
      const element = splitURL && splitURL.length > 1 ? document.getElementById(splitURL[1]) : null
      const elementTop = element ? element.getBoundingClientRect()?.top : 0
      if (element && elementTop && elementTop > 100) {
        window.scrollTo(0, elementTop - 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [router.asPath])

  useEffect(() => {
    setMenuIsOpen(document.documentElement.getAttribute('data-menu') === 'open')
    subscribe('menuChanged', (evt) => setMenuIsOpen(evt.detail.open))
  }, [])

  return (
    <header
      className={clsx(
        'sticky top-0 z-20 flex-none flex-wrap items-center justify-between bg-white px-4 py-5 shadow-md shadow-slate-900/5 transition duration-500 dark:shadow-none sm:px-6 lg:px-8',
        isScrolled ? 'dark:bg-slate-900/95 dark:backdrop-blur dark:[@supports(backdrop-filter:blur(0))]:bg-slate-900/75' : 'dark:bg-transparent',
        isMenuOpen ? 'hidden' : 'flex'
      )}
    >
      <div className="mr-6 flex overscroll-none lg:hidden">
        <MobileNavigation navigation={navigation} />
      </div>
      <div className="relative flex flex-grow basis-0 items-center">
        <Link href="/" aria-label="Home page">
          <Logomark className="h-9 w-9 lg:hidden" />
          <Logo className="hidden h-9 w-auto fill-slate-700 dark:fill-sky-100 lg:block" />
        </Link>
        <VersionSelector className="ml-6 block" />
      </div>
      <div className="-my-5 mr-6 sm:mr-8 md:mr-0">
        <Search />
      </div>
      <div className="relative flex basis-0 justify-end gap-6 sm:gap-8 md:flex-grow">
        <IssueSelector className="group relative z-10" />
        <ThemeSelector className="group relative z-10" />
        <Link href="https://github.com/sfccdevops/sfcc-docs" target="_blank" className="group hidden sm:block" aria-label="GitHub">
          <GitHubIcon className="h-6 w-6 fill-slate-400 group-hover:fill-slate-500 dark:group-hover:fill-slate-300" />
        </Link>
      </div>
    </header>
  )
}

export function Layout({ children, title, tableOfContents, isMarkdoc = false, isEmbedded = null }) {
  let router = useRouter()
  let isHomePage = router.pathname === '/'

  let allLinks = navigation.flatMap((section) => section.links)
  let linkIndex = allLinks.findIndex((link) => link?.href && link.href === router.pathname)
  let previousPage = linkIndex > -1 ? allLinks[linkIndex - 1] : null
  let nextPage = linkIndex > -1 ? allLinks[linkIndex + 1] : null
  let section = navigation.find((section) => section?.links && section.links.find((link) => link.href === router.pathname))

  const makeQuery = (str) => {
    return str.replace('[DEPRECATED] ', '').replace('Job Step: ', '').replace('Script: Class ', '').replace(':', '').replace(/\./g, ' ')
  }

  return (
    <main className={isEmbedded === null ? 'hidden' : 'ready'}>
      {isEmbedded === false && (
        <a
          id="skip-to-content-link"
          className="duration-350 absolute left-1/2 top-0 z-20 w-36 -translate-x-1/2 -translate-y-full transform rounded-b-md bg-slate-950 px-3 py-1 text-white transition focus:translate-y-0 dark:bg-slate-50 dark:text-black"
          href="#main"
          onClick={(evt) => {
            document.getElementById('main').scrollIntoView()
            evt.preventDefault()
            evt.target.blur()
          }}
        >
          Skip to Content
        </a>
      )}

      {navigation && isEmbedded === false && <Header navigation={navigation} />}

      {isHomePage && isEmbedded === false && <Hero />}

      <div className="relative mx-auto flex w-full max-w-8xl flex-auto scroll-mt-20 justify-center sm:px-2 lg:px-8 xl:px-12" id="main">
        {isEmbedded === false && (
          <div className="z-10 hidden lg:relative lg:block lg:flex-none">
            <div className="absolute inset-y-0 right-0 w-[50vw] bg-slate-50 dark:hidden" />
            <div className="absolute bottom-0 right-0 top-16 hidden h-12 w-px bg-gradient-to-t from-slate-800 dark:block" />
            <div className="absolute bottom-0 right-0 top-28 hidden w-px bg-slate-800 dark:block" />
            <div className="sticky inset-0 left-[max(0px,calc(50%-45rem))] right-auto top-[3.8125rem] z-20 -ml-0.5 hidden h-[calc(100vh-4.75rem)] w-64 overflow-y-auto overflow-x-hidden pb-10 pr-6 lg:block" id="main-menu">
              {navigation && <Navigation navigation={navigation} />}
            </div>
          </div>
        )}
        <div className={clsx('min-w-0 max-w-2xl flex-auto px-4 py-16 lg:max-w-none  lg:pr-0 xl:px-16', isEmbedded === false ? 'lg:pl-8' : 'lg:pl-0')}>
          {isMarkdoc ? (
            <article>
              {/* Document Title */}
              {!isHomePage && (title || section) && (
                <header className="mb-3 space-y-1">
                  {section && <p className="font-display text-sm font-medium text-slate-500 dark:text-slate-400">{section.title}</p>}
                  {title && <h1 className="font-display text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h1>}
                </header>
              )}

              {/* Sidebar Header Shortcuts */}
              <Prose>{children}</Prose>

              {/* Salesforce Copyright Added Back */}
              {!isHomePage && isEmbedded === false && <div className="mt-8 font-display text-sm font-medium text-slate-500 dark:text-slate-400">&copy; {new Date().getUTCFullYear()} salesforce.com, inc. All rights reserved.</div>}

              {/* GitHub Search Button */}
              {!isHomePage && isEmbedded === false && (
                <div className="mt-10 bg-slate-50 shadow dark:bg-slate-950/40 dark:text-white sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white" id="get-examples">
                      Usage Examples
                    </h3>
                    <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                      <div className="max-w-xl text-sm text-slate-500">
                        <p>Cartridges posted on GitHub can be quickly searched for examples to help you learn. You&apos;ll need to be logged in to GitHub for this to work.</p>
                      </div>
                      <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:flex-shrink-0 sm:items-center">
                        <a
                          href={`https://github.com/search?q=${makeQuery(title)}+%28path%3A*.isml+OR+path%3A*.js+OR+path%3A*.ds%29+path%3A*%2Fcartridge%2F**&type=code&ref=advsearch`}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center rounded-full bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-sky-500"
                        >
                          Search GitHub
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Diff Timeline */}
              {!isHomePage && isEmbedded === false && <DiffTimeline />}
            </article>
          ) : (
            children
          )}
          {(previousPage || nextPage) && isEmbedded === false && (
            <dl className="mt-12 flex border-t border-slate-200 pt-6 dark:border-slate-800">
              {previousPage && (
                <div>
                  <dt className="font-display text-sm font-medium text-slate-900 dark:text-white">Previous</dt>
                  <dd className="mt-1">
                    <Link href={previousPage.href} className="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300">
                      <span aria-hidden="true">&larr;</span> {previousPage.title}
                    </Link>
                  </dd>
                </div>
              )}
              {nextPage && (
                <div className="ml-auto text-right">
                  <dt className="font-display text-sm font-medium text-slate-900 dark:text-white">Next</dt>
                  <dd className="mt-1">
                    <Link href={nextPage.href} className="text-base font-semibold text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300">
                      {nextPage.title} <span aria-hidden="true">&rarr;</span>
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
        {isMarkdoc && isEmbedded === false && (
          <div className="hidden xl:sticky xl:top-[4.75rem] xl:-mr-6 xl:block xl:h-[calc(100vh-4.75rem)] xl:flex-none xl:overflow-y-auto xl:py-16 xl:pr-6">
            <nav aria-labelledby="on-this-page-title" className="w-56">
              {tableOfContents.length > 0 && (
                <>
                  {!isHomePage && (
                    <h2 id="quick-links" className="font-display text-sm font-medium text-slate-900 dark:text-white">
                      Quick links
                    </h2>
                  )}
                  {!isHomePage && (
                    <ol role="list" className="mt-4 space-y-3 text-sm">
                      <li>
                        <Link href={`#get-examples`} scroll={false} className="font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                          Usage Examples
                        </Link>
                      </li>
                      <li>
                        <Link href={`#version-history`} scroll={false} className="font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                          Version History
                        </Link>
                      </li>
                    </ol>
                  )}

                  <h2 id="on-this-page-title" className="mt-10 font-display text-sm font-medium text-slate-900 dark:text-white">
                    On this page
                  </h2>
                  <ol role="list" className="mt-4 space-y-3 text-sm">
                    {tableOfContents.map((section) => (
                      <li key={section.id}>
                        <h3>
                          <Link href={`#${section.id}`} scroll={false} className="font-normal text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300">
                            {section.title}
                          </Link>
                        </h3>
                        {section.children.length > 0 && (
                          <ol role="list" className="mt-2 space-y-3 pl-5 text-slate-500 dark:text-slate-400">
                            {section.children.map((subSection) => (
                              <li key={subSection.id}>
                                <Link href={`#${subSection.id}`} scroll={false} className="hover:text-slate-600 dark:hover:text-slate-300">
                                  {subSection.title}
                                </Link>
                              </li>
                            ))}
                          </ol>
                        )}
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </main>
  )
}
