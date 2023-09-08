import { Diff, Hunk } from 'react-diff-view';
import { useEffect, useState } from 'react'

export function DiffView({ file }) {
  let [diff, setDiff] = useState(null)

  useEffect(() => {
    async function fetchData(file) {
      const res = await fetch(file)
      const diff = await res.json()
      setDiff(diff)
    }
    fetchData(file)
  }, [file]);

  const renderFile = ({oldRevision, newRevision, type, hunks}) => (
    <Diff key={oldRevision + '-' + newRevision} viewType="unified" diffType={type} hunks={hunks}>
        {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
    </Diff>
  );

  return diff && <div className="text-slate-600 dark:text-slate-300 font-mono text-xs">{diff.map(renderFile)}</div>
}
