import { Diff, Hunk, tokenize, markEdits } from 'react-diff-view'
import { useEffect, useState, useMemo } from 'react'

export function DiffView({ file }) {
  let [diff, setDiff] = useState(null)

  useEffect(() => {
    async function fetchData(file) {
      const res = await fetch(file)
      const diff = await res.json()
      setDiff(diff)
    }
    fetchData(file)
  }, [file])

  const tokens = useMemo(() => {
    if (!diff) {
      return undefined
    }

    const options = {
      highlight: false,
      enhancers: [markEdits(diff[0].hunks, { type: 'block' })],
    }

    return tokenize(diff[0].hunks, options)
  }, [diff])

  const renderFile = ({ oldRevision, newRevision, type, hunks }) => (
    <Diff key={oldRevision + '-' + newRevision} viewType="unified" diffType={type} hunks={hunks} tokens={tokens}>
      {(hunks) => hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)}
    </Diff>
  )

  return diff && <div className="font-mono text-xs text-slate-600 dark:text-slate-300">{diff.map(renderFile)}</div>
}
