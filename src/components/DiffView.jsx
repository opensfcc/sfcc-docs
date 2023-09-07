import { Diff, Hunk } from 'react-diff-view';

export const getStaticProps = async () => {
  const res = await fetch('https://api.github.com/repos/vercel/next.js')
  const repo = await res.json()

  console.log(repo)
  return { props: { repo } }
}

export function DiffView({ props }) {
  // const test = '@/data/diff-22.6-5.jsx'
  // const { diff } = require(test)

  console.log('props', props)

  const renderFile = ({oldRevision, newRevision, type, hunks}) => (
    <Diff key={oldRevision + '-' + newRevision} viewType="unified" diffType={type} hunks={hunks}>
        {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
    </Diff>
  );

  // return file && <div className="text-slate-600 dark:text-slate-300 font-mono text-xs">{file.map(renderFile)}</div>
  return <div>{'HELLO'}</div>
}
