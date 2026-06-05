import { HeadingCollector } from "./collector/heading";
import { IdCollector } from "./collector/id-collector";
import { type NodeI, type Parser } from "./types/type";
import { TableView } from "./utils/table-renderer";
import Counter from "./collector/counter";
import { uid } from "./utils/uuid";
import { GridView } from "./utils/grid-renderer";

export class Converter {
  private static custom: Record<string, Parser> = {};

  constructor(private markExcept: string[] = []) {}

  private getHtmlContent(nodes?: NodeI[]): Node[] {
    if (!nodes) return [];
    return nodes.map((n) => this.parse(n));
  }

  static register(name: string, handler: Parser) {
    this.custom[name] = handler;
  }

  private assignUUID(el: HTMLElement, node?: NodeI) {
    const uuid = node?.attrs?.id || uid();

    el.setAttribute("data-uuid", uuid);

    if (!el.id && node?.attrs?.id) {
      el.id = node.attrs.id;
    }

    return el;
  }

  parse(node: NodeI) {
    if (node.type == "register") {
      console.warn("cannot parsing node with type register");
      return document.createTextNode("");
    }

    const fn = (this as any)[node.type];

    if (typeof fn === "function") {
      return (fn as Parser).call(this, node);
    }

    return document.createTextNode("");
  }

  paragraph(node: NodeI): HTMLElement {
    const p = document.createElement("p");

    p.lang = "id";

    if (node.content) p.append(...this.getHtmlContent(node.content));
    else p.innerHTML = "&nbsp;";

    this.assignUUID(p, node);

    return p;
  }

  cite(
    node: NodeI<{
      cite: string;
      citeA: boolean;
      manual: boolean;
      text: string;
      year: string;
    }>
  ) {
    const cite = document.createElement("a");

    cite.setAttribute("data-cite", "1");
    cite.setAttribute("data-manual", node.attrs?.manual ? "1" : "0");
    cite.setAttribute("data-text", node.attrs?.text || "");
    cite.setAttribute("data-year", node.attrs?.year || "");

    cite.href = `#${node.attrs!.cite}`;

    if (node.attrs?.citeA) {
      cite.setAttribute("citeA", "true");
    }

    this.assignUUID(cite, node);

    const p = document.createElement("cite");

    p.append(cite);

    return p;
  }

  heading(node: NodeI): HTMLElement {
    const level = node.attrs?.level ?? 1;

    const h = document.createElement(`h${level}`) as HTMLHeadingElement;

    h.id = node.attrs?.id || uid();

    if (node.attrs?.level == 1) {
      Counter.increaseHeading();
    }

    if (node.content) h.append(...this.getHtmlContent(node.content));

    this.assignUUID(h, node);

    HeadingCollector.add(node);

    return h;
  }

  listItem(node: NodeI): HTMLElement {
    const li = document.createElement("li");

    if (node.content) li.append(...this.getHtmlContent(node.content));

    this.assignUUID(li, node);

    return li;
  }

  orderedList(node: NodeI): HTMLElement {
    const ol = document.createElement("ol");

    if (node.attrs?.start) {
      ol.setAttribute("start", node.attrs.start);
    }

    if (node.content) ol.append(...this.getHtmlContent(node.content));

    this.assignUUID(ol, node);

    return ol;
  }

  bulletList(node: NodeI): HTMLElement {
    const ul = document.createElement("ul");

    if (node.content) ul.append(...this.getHtmlContent(node.content));

    this.assignUUID(ul, node);

    return ul;
  }

  text(node: NodeI): Node {
    let text = node.text ?? "";

    let el: Node = document.createTextNode(text);

    if (node.marks) {
      node.marks.forEach((mark) => {
        if (typeof (this as any)[mark.type] === "function") {
          if (!this.markExcept.includes(mark.type)) {
            el = (this as any)[mark.type](el.textContent || "");
          }
        }
      });
    }

    return el;
  }

  bold(text: string): HTMLElement {
    const b = document.createElement("b");

    b.textContent = text;

    this.assignUUID(b);

    return b;
  }

  italic(text: string): HTMLElement {
    const em = document.createElement("em");

    em.textContent = text;

    this.assignUUID(em);

    return em;
  }

  image(node: NodeI): HTMLElement {
    const wrapper = document.createElement("div");

    wrapper.style.display = "inline-block";
    wrapper.style.width = `${node.attrs?.width}px`;
    wrapper.style.height = "auto";
    wrapper.style.maxWidth = "100%";

    const img = document.createElement("img");

    img.src = node.attrs?.src;
    img.className = "image-figure";
    img.style.width = "100%";
    img.style.height = "auto";

    this.assignUUID(img, node);

    wrapper.append(img);

    this.assignUUID(wrapper, node);

    return wrapper;
  }

  figure(node: NodeI): HTMLElement {
    const fig = document.createElement("figure");

    if (node.attrs?.figureId) fig.id = node.attrs.figureId;

    if (node.content) fig.append(...this.getHtmlContent(node.content));

    this.assignUUID(fig, node);

    return fig;
  }

  figcaption(node: NodeI, type?: string, id?: string): HTMLElement {
    const cap = document.createElement("figcaption");

    cap.style.textAlign = "center";

    if (type) cap.dataset.type = type;

    if (id) cap.id = id;

    if (node.content) {
      cap.append(...this.getHtmlContent(node.content));
    }

    this.assignUUID(cap, node);

    const clone = cap.cloneNode(true);

    let tmpNode: HTMLElement[] = [];

    clone.childNodes.forEach((e) => {
      const cloned = e.cloneNode(true);

      tmpNode.push(cloned as HTMLElement);
    });

    if (type == "imageFigure") {
      Counter.increaseImage();

      Counter.addImage({
        id: id!,
        caption: tmpNode,
      });
    }

    if (type == "figureTable") {
      Counter.increaseTable();

      Counter.addTable({
        id: id!,
        caption: tmpNode,
      });
    }

    return cap;
  }

  imageFigure(node: NodeI): HTMLElement {
    const fig = document.createElement("figure");

    fig.dataset.type = "imageFigure";
    fig.style.display = "flex";
    fig.style.flexDirection = "column";
    fig.style.alignItems = "center";
    fig.style.width = "100%";

    if (node.attrs?.figureId) {
      fig.setAttribute("figureId", node.attrs.figureId);
    }

    if (node.content) {
      const [imgNode, captionNode] = node.content;

      if (imgNode) fig.append(this.parse(imgNode));

      if (captionNode) {
        fig.append(
          this.figcaption(
            captionNode,
            "imageFigure",
            node.attrs?.id
          )
        );
      }
    }

    this.assignUUID(fig, node);

    return fig;
  }

  figureTable(node: NodeI): HTMLElement {
    const fig = document.createElement("figure");

    fig.dataset.type = "figureTable";

    if (node.content) {
      const [caption, table] = node.content;

      if (caption) {
        const capNode = this.figcaption(
          caption,
          "figureTable",
          node.attrs?.id
        );

        fig.append(capNode);
      }

      if (table) {
        fig.append(this.parse(table));
      }
    }

    this.assignUUID(fig, node);

    return fig;
  }

  mathInline(node: NodeI): HTMLElement {
    const span = document.createElement("span");

    span.dataset.latex = node.attrs?.latex || "";

    this.assignUUID(span, node);

    return span;
  }

  blockMath(node: NodeI): HTMLElement {
    const outer = document.createElement("div");

    outer.style.display = "flex";
    outer.style.justifyContent = "center";
    outer.style.width = "100%";

    const inner = document.createElement("div");

    inner.dataset.latex = node.attrs?.latex ?? "";

    const label = document.createElement("div");

    label.classList.add("equation");
    label.id = node.attrs?.id || "eq:" + IdCollector.getId("");

    outer.append(inner, label);

    this.assignUUID(inner, node);
    this.assignUUID(label, node);
    this.assignUUID(outer, node);

    return outer;
  }

  table(node: NodeI): HTMLElement {
    const table = TableView.render(node);

    this.assignUUID(table, node);

    return table;
  }

  tableRow(node: NodeI): HTMLElement {
    const tr = document.createElement("tr");

    if (node.content) tr.append(...this.getHtmlContent(node.content));

    this.assignUUID(tr, node);

    return tr;
  }

  tableCell(node: NodeI): HTMLElement {
    const td = document.createElement("td");

    td.colSpan = node.attrs?.colspan ?? 1;
    td.rowSpan = node.attrs?.rowspan ?? 1;

    const width = node.attrs?.colwidth?.reduce(
      (e: number, w: number) => e + w
    );

    if (width) {
      td.setAttribute("colwidth", width);
      td.style.minWidth = `${width}px`;
    }

    td.classList.add(this.getCellAlignment(node.attrs?.align));
    td.style.textAlign = this.getCellAlignment(node.attrs?.align);

    td.append(...this.getHtmlContent(node.content || []));

    this.assignUUID(td, node);

    return td;
  }

  tableHeader(node: NodeI): HTMLElement {
    const th = document.createElement("th");

    th.colSpan = node.attrs?.colspan ?? 1;
    th.rowSpan = node.attrs?.rowspan ?? 1;

    const width = node.attrs?.colwidth?.reduce(
      (e: number, w: number) => e + w
    );

    if (width) {
      th.setAttribute("colwidth", width);
      th.style.minWidth = `${width}px`;
    }

    th.style.textAlign = this.getCellAlignment(node.attrs?.align);

    th.classList.add(this.getCellAlignment(node.attrs?.align));

    th.append(...this.getHtmlContent(node.content || []));

    this.assignUUID(th, node);

    return th;
  }

  ref(node: NodeI): HTMLElement {
    const a = document.createElement("a");

    if (node.attrs?.link) {
      a.href = `#${node.attrs.link}`;
    }

    if (node.attrs?.ref) {
      a.className = (node.attrs.ref as string).toLowerCase();
    }

    a.textContent = `(ref ${node.attrs?.ref ?? ""})`;

    this.assignUUID(a, node);

    return a;
  }

  refComponent(node: NodeI): HTMLElement {
    return this.ref(node);
  }

  hardBreak(node: NodeI): HTMLParagraphElement {
    const p = document.createElement("p");

    p.innerHTML = "&nbsp;";

    this.assignUUID(p, node);

    return p;
  }

  private getCellAlignment(alignment?: string): string {
    switch (alignment) {
      case "left":
        return "left";

      case "center":
        return "center";

      default:
        return "left";
    }
  }

  grid(node:NodeI){
    const table = GridView.render(node);

    this.assignUUID(table, node);
    const wrapper =document.createElement("div")
    wrapper.classList.add("node-grid")
    wrapper.append(table)
    return wrapper

  }

  codeBlock(node:NodeI<{language:string|null}>){
    const pre =document.createElement("pre")
    const code = document.createElement("code")
    const text = node.content?.length ? node.content[0]?.text || "" : "" 
    code.innerText =text
    pre.append(code)
    return pre
  }

  hasMethod(method: string): boolean {
    return typeof (this as any)[method] === "function";
  }
}