import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer'
import { useEffect, useState } from 'react'

import { subscribe } from '../events'

// TODO: Pull the old HTML from a specific doc version
const oldCode = `
{
  "name": "Original name",
  "description": null
}
`

// TODO: Pull the changed HTML from a specific doc version
const newCode = `
{
  "name": "My updated name",
  "description": "Brand new description",
  "status": "running"
}
`

const newStyles = {
  variables: {
    dark: {
      addedBackground: '#103725',
      addedColor: 'white',
      codeFoldBackground: '#262831',
      codeFoldContentColor: '#555a7b',
      diffViewerBackground: '#0f162a',
      diffViewerColor: 'white',
      emptyLineBackground: '#363946',
      removedBackground: '#331c2d',
      removedColor: 'white',
      wordAddedBackground: '#15803d',
      wordRemovedBackground: '#932020',
    },
    light: {
      addedBackground: '#e1f9ea',
      addedColor: 'black',
      codeFoldBackground: '#f1f8ff',
      codeFoldContentColor: '#212529',
      emptyLineBackground: '#fafbfc',
      removedBackground: '#fff5f5',
      removedColor: 'black',
      wordAddedBackground: '#a9efc3',
      wordRemovedBackground: '#fcb6b6',
    },
  },
  line: {
    fontSize: '14px',
    padding: '10px 2px',
    '&:hover': {
      background: 'transparent',
    },
  },
  diffContainer: {
    lineHeight: '20px',
  },
  gutter: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
  },
  contentText: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
  },
}

export function Diff() {
  let [useDarkTheme, setUseDarkTheme] = useState(null)

  const getTheme = (theme) => {
    return theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  }

  useEffect(() => {
    subscribe('themeChanged', (evt) => setUseDarkTheme(() => getTheme(evt.detail.theme)))
    setUseDarkTheme(() => getTheme(window.localStorage.theme))
  }, [useDarkTheme])

  return <ReactDiffViewer styles={newStyles} hideLineNumbers={true} useDarkTheme={useDarkTheme} oldValue={oldCode} newValue={newCode} compareMethod={DiffMethod.WORDS} splitView={false} />
}
