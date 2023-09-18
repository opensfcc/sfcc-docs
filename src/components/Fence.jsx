import { Fragment } from 'react'
import Highlight, { defaultProps } from 'prism-react-renderer'

export function Fence({ children, language }) {
  let defaultLanguage = 'javascript'

  if (children && children.startsWith('<')) {
    defaultLanguage = 'html'
  }

  if (children && children.startsWith('<?')) {
    defaultLanguage = 'xml'
  }

  return (
    <Highlight {...defaultProps} code={children.trimEnd()} language={language || defaultLanguage} theme={undefined}>
      {({ className, style, tokens, getTokenProps }) => (
        <pre className={className} style={style}>
          <code>
            {tokens.map((line, lineIndex) => (
              <Fragment key={lineIndex}>
                {line
                  .filter((token) => !token.empty)
                  .map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                {'\n'}
              </Fragment>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  )
}
