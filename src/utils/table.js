export const codeFormatter = (cell) => {
  return (
    <div>
      <pre>{cell}</pre>
    </div>
  )
}

export const inlineCodeFormatter = (cell) => {
  return <code>{cell}</code>
}

export const binPrefixFormatter = (cell) => inlineCodeFormatter('0x' + cell)
