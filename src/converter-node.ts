import { HeadingCollector } from "./collector/heading";
import { IdCollector } from "./collector/id-collector";
import {type NodeI} from "./types/type"
import { TableView } from "./utils/table-renderer";
import Counter from "./collector/counter";
export class Converter {



  constructor(private markExcept:string[] =[]){}
  private getHtmlContent(nodes?: NodeI[]): Node[] {
    if (!nodes) return []
    return nodes.map((n) => this.parse(n))
  }

  parse(node: NodeI): Node {
    const fn = (this as any)[node.type]
    if (typeof fn === "function") {
      return fn.call(this, node)
    }

    return document.createTextNode("")
  }

  paragraph(node: NodeI): HTMLElement {
    const p = document.createElement("p")
    p.lang = "id"
    if (node.content) p.append(...this.getHtmlContent(node.content))
    else p.innerHTML = "&nbsp;"
    return p
  }
  cite(node:NodeI<{cite:string,citeA:boolean}>)
  
  {
    const cite = document.createElement('a')
    cite.setAttribute('data-cite','1')
    cite.href = `#${node.attrs!.cite}`
    if (node.attrs?.citeA) {
      cite.setAttribute('citeA','true')
      
    }
    return cite;

  }
  heading(node: NodeI): HTMLElement {
    const level = node.attrs?.level ?? 1
    const h = document.createElement(`h${level}`) as HTMLElement
    if (node.attrs?.id){
       node.attrs.id = IdCollector.getId(node.attrs.id)
       h.id = node.attrs.id
      }
    if (node.attrs?.level == 1) {
      Counter.increaseHeading()
      
    }
    if (node.content) h.append(...this.getHtmlContent(node.content))
    HeadingCollector.add(node)
    return h
  }

  listItem(node: NodeI): HTMLElement {
    const li = document.createElement("li")
    if (node.content) li.append(...this.getHtmlContent(node.content))
    return li
  }

  orderedList(node: NodeI): HTMLElement {
    const ol = document.createElement("ol")
    if (node.attrs?.start) ol.setAttribute("start", node.attrs.start)
    if (node.content) ol.append(...this.getHtmlContent(node.content))
    return ol
  }

  bulletList(node: NodeI): HTMLElement {
    const ul = document.createElement("ul")
    if (node.content) ul.append(...this.getHtmlContent(node.content))
    return ul
  }

  text(node: NodeI,except?:string[]): Node {
    let text = node.text ?? ""

    let el: Node = document.createTextNode(text)

    if (node.marks) {
      node.marks.forEach((mark) => {
        if (typeof (this as any)[mark.type] === "function") {
          if ( !this.markExcept.includes(mark.type)) {            
            el = (this as any)[mark.type](el.textContent || "")
          }
        }
      })
    }

    return el
  }

  bold(text: string): HTMLElement {
    const b = document.createElement("b")
    b.textContent = text
    return b
  }

  italic(text: string): HTMLElement {
    const em = document.createElement("em")
    em.textContent = text
    return em
  }

  image(node: NodeI): HTMLElement {
    const wrapper = document.createElement("div")
    wrapper.style.position = "relative"
    wrapper.style.display = "inline-block"
    wrapper.style.width = `${node.attrs?.width}px`
    wrapper.style.maxWidth = "100%"

    const img = document.createElement("img")
    img.src = node.attrs?.src
    img.className = "image-figure"
    img.style.width = "100%"
    img.style.height = "auto"

    wrapper.append(img)
    return wrapper
  }

  figure(node: NodeI): HTMLElement {
    const fig = document.createElement("figure")
    if (node.attrs?.figureId) fig.id = node.attrs.figureId
    if (node.content) fig.append(...this.getHtmlContent(node.content))
    return fig
  }

  figcaption(node: NodeI, type?: string, id?: string): HTMLElement {
    const cap = document.createElement("figcaption")
    cap.style.textAlign = "center"
    if (type) cap.dataset.type = type
   
    if (id) cap.id = id
    if (node.content) cap.append(...this.getHtmlContent(node.content))
       if (type == 'imageFigure') {
          Counter.increaseImage()
          let nodes =[]
         for (let index = 0; index < cap.children.length; index++) {
            nodes.push(cap.children.item(index) as HTMLElement)
          
         }
          Counter.addImage({id:id!,caption:nodes})    
        }
        if (type == 'figureTable') {
          Counter.increaseTable()
          let nodes =[]
          for (let index = 0; index < cap.children.length; index++) {
            nodes.push(cap.children.item(index) as HTMLElement)
          
         }
         Counter.addTable({id:id!,caption:nodes})
          
        }
    return cap
  }

  imageFigure(node: NodeI): HTMLElement {
    const fig = document.createElement("figure")
    fig.dataset.type = "imageFigure"
    fig.style.display = "flex"
    fig.style.flexDirection = "column"
    fig.style.alignItems = "center"
    fig.style.width = "100%"
    if (node.attrs?.figureId) fig.setAttribute("figureId", node.attrs.figureId)
    if (node.content) {
      const [imgNode, captionNode] = node.content
      if (imgNode) fig.append(this.parse(imgNode))
      if (captionNode)
        fig.append(this.figcaption(captionNode, "imageFigure", node.attrs?.id))
    }
    return fig
  }

  figureTable(node: NodeI): HTMLElement {
    const fig = document.createElement("figure")
    fig.dataset.type = "figureTable"
    if (node.attrs?.id) fig.id = node.attrs.id
    if (node.content) {
      
      const [caption,table] =  node.content
      if (caption) {
       const capNode = this.figcaption(caption,node.attrs?.type,node.attrs?.id)
       fig.append(capNode)
      }
      table && fig.append(this.parse(table))
    }
    return fig
  }

  mathInline(node: NodeI): HTMLElement {
    const span = document.createElement("span")
    span.dataset.latex = node.attrs?.latex
    return span
  }

  blockMath(node: NodeI): HTMLElement {
    const outer = document.createElement("div")
    outer.style.display = "flex"
    outer.style.justifyContent = "center"
    outer.style.width = "100%"

    const inner = document.createElement("div")
    inner.dataset.latex = node.attrs?.latex ?? ""
    outer.append(inner)
    return outer
  }

  table(node: NodeI): HTMLElement {
    return TableView.render(node)
  }

  tableRow(node: NodeI): HTMLElement {
    const tr = document.createElement("tr")
    if (node.content) tr.append(...this.getHtmlContent(node.content))
    return tr
  }

  tableCell(node: NodeI): HTMLElement {
    const td = document.createElement("td")
    td.colSpan = node.attrs?.colspan ?? 1
    td.rowSpan = node.attrs?.rowspan ?? 1
    td.style.width = node.attrs?.colwidth?.[0]
      ? `${node.attrs.colwidth[0]}px`
      : "auto"

    const inner = document.createElement("div")
    inner.style.display = "flex"
    inner.style.flexDirection = "column"
    inner.style.justifyContent = "center"
    inner.style.alignItems = this.getCellAlignment(node.attrs?.align)
    if (node.content) inner.append(...this.getHtmlContent(node.content))

    td.append(inner)
    return td
  }

  tableHeader(node: NodeI): HTMLElement {
    const th = document.createElement("th")
    th.colSpan = node.attrs?.colspan ?? 1
    th.rowSpan = node.attrs?.rowspan ?? 1
    th.style.width = node.attrs?.colwidth?.[0]
      ? `${node.attrs.colwidth[0]}px`
      : "auto"

    const inner = document.createElement("div")
    inner.style.display = "flex"
    inner.style.flexDirection = "column"
    inner.style.justifyContent = "center"
    inner.style.alignItems = this.getCellAlignment(node.attrs?.align)
    if (node.content) inner.append(...this.getHtmlContent(node.content))

    th.append(inner)
    return th
  }

  ref(node: NodeI): HTMLElement {
    const a = document.createElement("a")
    if (node.attrs?.link) a.href = `#${node.attrs.link}`
    if (node.attrs?.ref) a.className = (node.attrs.ref as string).toLowerCase()
    a.textContent = `(ref ${node.attrs?.ref ?? ""})`
    return a
  }

  refComponent(node: NodeI): HTMLElement {
    return this.ref(node)
  }

  private getCellAlignment(alignment?: string): string {
    switch (alignment) {
      case "left":
        return "start"
      case "center":
        return "center"
      default:
        return "start"
    }
  }

  hasMethod(method: string): boolean {
    return (
      typeof (this as any)[method] === "function" 
    )
  }
}
