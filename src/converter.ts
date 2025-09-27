import { Converter } from "./converter-node";
import TocBuilder from "./toc";
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
    const content = TocBuilder.render(nodes)
    tocEl.appendChild(content);
  }

  render(nodes: NodeI[], appendTo: HTMLElement) {
    const elmns = nodes.map((n) => {
      return this.converter.parse(n);
    });

    appendTo.append(...elmns);
  }
}
