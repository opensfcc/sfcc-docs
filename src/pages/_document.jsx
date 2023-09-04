import { Head, Html, Main, NextScript } from 'next/document'

// Load our supported versions from the JSON file
import versions from '@/data/json/versions.json'

// Get the version that is "current" so we can use it as a default
const defaultVersion = versions.find((version) => version.release === 'current')

// This script is used to set the theme and version in localStorage
const headerScript = `
  window.defaultVersion = '${defaultVersion.value}'
  window.useVersion = window.location.pathname.split('/')[1] || window.defaultVersion

  let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)')
  function updateTheme(theme) {
    theme = theme ?? window.localStorage.theme ?? 'system'

    if (theme === 'dark' || (theme === 'system' && isDarkMode.matches)) {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light' || (theme === 'system' && !isDarkMode.matches)) {
      document.documentElement.classList.remove('dark')
    }

    return theme
  }

  function updateThemeWithoutTransitions(theme) {
    updateTheme(theme)
    document.documentElement.classList.add('[&_*]:!transition-none')
    window.setTimeout(() => {
      document.documentElement.classList.remove('[&_*]:!transition-none')
    }, 0)
  }

  document.documentElement.setAttribute('data-theme', updateTheme())

  new MutationObserver(([{ oldValue }]) => {
    let newValue = document.documentElement.getAttribute('data-theme')
    if (newValue !== oldValue) {
      try {
        window.localStorage.setItem('theme', newValue)
      } catch {}
      updateThemeWithoutTransitions(newValue)
    }
  }).observe(document.documentElement, { attributeFilter: ['data-theme'], attributeOldValue: true })

  isDarkMode.addEventListener('change', () => updateThemeWithoutTransitions())

  function updateVersion(version) {
    version = version ?? window.localStorage.version ?? window.useVersion
    return version
  }

  document.documentElement.setAttribute('data-version', updateVersion())

  new MutationObserver(([{ oldValue }]) => {
    let newValue = document.documentElement.getAttribute('data-version')
    if (newValue !== oldValue) {
      try {
        window.localStorage.setItem('version', newValue)
      } catch {}
    }
  }).observe(document.documentElement, { attributeFilter: ['data-version'], attributeOldValue: true })

  // TODO: Figure out how to handle version switching with popstate
  window.addEventListener('popstate', (event) => {
    if (event.isTrusted && event.state?.url) {
      const popVersion = event.state?.url.split('/')[1] || window.useVersion

      if (popVersion !== window.localStorage.version) {
        document.documentElement.setAttribute('data-version', popVersion)
        window.localStorage.setItem('version', popVersion)
        window.location.reload()
      }
    }

  });
`

export default function Document() {
  return (
    <Html className="h-full scroll-smooth antialiased [font-feature-settings:'ss01']" lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: headerScript }} />
      </Head>
      <body className="flex min-h-full bg-white dark:bg-slate-900 [&>#\_\_next]:flex [&>#\_\_next]:w-full [&>#\_\_next]:flex-col">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
