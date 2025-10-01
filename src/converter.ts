import { HeadingCollector } from "./collector/heading";
import { Converter } from "./converter-node";
import {TocBuilder} from "./toc";
import type { NodeI } from "./types/type";

export class Parser {
  private converter: Converter;

  constructor() {
    this.converter = new Converter();
  }

  static buildHeading({text,level,id}:{text:string,level?:number,id:string}):NodeI{
    level = level ? level : 1;
    return {
      type:"heading",
      attrs:{
        level,
        id
      },
      content:[
        {type:'text',
          text
        }
      ]
    }

  }


 buildListContent(content?:NodeI[]){

 }

  toc(nodes: NodeI[], tocEl: HTMLElement) {
    const content = (new TocBuilder).render()
    tocEl.appendChild(content);
  }

  async tocLazy(gen: AsyncIterable<NodeI>, appendTo: HTMLElement){

  }

  async renderLazy(gen: AsyncIterable<NodeI>, appendTo: HTMLElement) {
    for await (const node of gen) {
      const el = this.converter.parse(node);
      appendTo.append(el);
      await new Promise(requestAnimationFrame);
    }
  }
  render(nodes: NodeI[], appendTo: HTMLElement) {
    HeadingCollector.reset()
    HeadingCollector.start()
    const elmns = nodes.map((n) => {
      return this.converter.parse(n);
    });

    appendTo.append(...elmns);
  }
}
