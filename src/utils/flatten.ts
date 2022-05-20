const flatten = (arr: any[]): any[] =>
  arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])

export default flatten
