import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'

import { Disclosure } from '@headlessui/react'
import { ChevronRightIcon } from '@heroicons/react/20/solid'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function Navigation({ navigation, className }) {
  let router = useRouter()

  return (
    <nav className={clsx('text-base lg:text-sm', className)}>
      <ul role="list" className="space-y-9">
        {navigation.map((section) => (
          <li key={section.title}>
            <h2 className="font-display font-medium text-slate-900 dark:text-white">{section.title}</h2>
            <ul
              role="list"
              className="mt-2 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 lg:mt-4 lg:space-y-4 lg:border-slate-200"
            >
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
                              <ChevronRightIcon
                                className={classNames(
                                  open ? 'sky-500 rotate-90' : 'text-gray-400',
                                  'relative top-0.5 ml-auto h-5 w-5 shrink-0'
                                )}
                                aria-hidden="true"
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel
                              as="ul"
                              role="list"
                              className="mt-4 space-y-2 space-y-4 space-y-9 border-slate-100 dark:border-slate-800 lg:mt-2 lg:mt-4 lg:space-y-2.5 lg:border-slate-200"
                            >
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
