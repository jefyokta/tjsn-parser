

export interface NodeI<T = Record<string,any>> {
  type: string
  text?: string
  content?: NodeI[]
  marks?: { type: string }[]
  attrs?:T
}


export type Parser = (node:NodeI)=>Node;