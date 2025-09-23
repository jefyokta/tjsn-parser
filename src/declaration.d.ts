interface NodeI {
  type: string
  text?: string
  content?: NodeI[]
  marks?: { type: string }[]
  attrs?: Record<string, any>
}


type Parser = (node:Node)=>string;