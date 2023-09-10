import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon, BugAntIcon } from '@heroicons/react/24/outline'

const instructions = [
  {
    label: 'Use Bug Icon in the top right to report issues on GitHub.',
  },
  {
    label: 'Version Switching will be available after initial round of testing is complete.',
  },
  {
    label: 'If you run into any issues, please let us know which URL you were on and what you were trying to do.',
  },
]

export function Testers(props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="w-full flex-auto items-center bg-sky-600 px-6 py-2.5 text-center sm:px-3.5">
        <p className="text-sm leading-6 text-white">
          <button role="button" onClick={() => setOpen(true)}>
            <strong className="font-semibold">TESTERS</strong>
            <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true">
              <circle cx={1} cy={1} r={1} />
            </svg>
            Thanks for helping out!&nbsp; Click here for testing instructions&nbsp;<span aria-hidden="true">&rarr;</span>
          </button>
        </p>
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 flex" onClose={setOpen}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 z-40 bg-slate-950 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 w-screen overflow-y-auto bg-slate-900/50 backdrop-blur">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <BugAntIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                        SFCC Docs Testers
                      </Dialog.Title>
                      <ul role="list" className="-mb-4 mt-6 text-left">
                        {instructions.map((step, stepIdx) => (
                          <li key={stepIdx}>
                            <div className="relative pb-6">
                              {stepIdx !== instructions.length - 1 ? <span className="absolute left-3 top-3 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 ring-8 ring-white">
                                    <CheckIcon className="h-4 w-4 text-white" aria-hidden="true" />
                                  </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4">
                                  <div>
                                    <p className="text-gray-500">{step.label}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                      onClick={() => setOpen(false)}
                    >
                      Got it, Thanks !
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
