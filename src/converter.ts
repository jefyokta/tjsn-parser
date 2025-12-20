import Counter from "./collector/counter";
import { HeadingCollector } from "./collector/heading";
import { Converter } from "./converter-node";
import List from "./list/list";
import {TocBuilder} from "./toc";
import type { NodeI } from "./types/type";

export class Parser {
  private converter: Converter;

  private praHead :{text:string,id:string}[]= []
  private afterHead :{text:string,id:string}[]= []
  private imageName = 'Gambar'
  private tableName ='Tabel'

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
        {
          type:'text',
          text
        }
      ]
    }

  }
  tocPrahead(pra:string,id:string){

    this.praHead.push({text:pra,id})
  }
  tocAfterHead(text:string,id:string){
    this.afterHead.push({text,id})
  }

  toc(tocEl: HTMLElement,nodes?:NodeI[]) {

    const builder = new TocBuilder;
    this.praHead.forEach(s=>{
      builder.withPraHeading(s)
    })
     this.afterHead.forEach(s=>{
      builder.withAfterHeading(s)
    })
    const content = builder._render(nodes)

    tocEl.appendChild(content);
  }

  render(nodes: NodeI[], appendTo: HTMLElement) {
    HeadingCollector.reset()
    HeadingCollector.start()
    const elmns = nodes.map((n) => {
      return this.converter.parse(n);
    });

    appendTo.append(...elmns);
    this.fixRef(appendTo)
    return new List(this.tableName,this.imageName)
  }

  private fixRef(el:HTMLElement){
    el.querySelectorAll<HTMLAnchorElement>('a.imagefigure').forEach(e=>{
      const id = e.getAttribute('href')?.slice(1,e.getAttribute('href')?.length)
     const data = Counter.getImageCounter(id||'')
     if (data) {
      e.textContent = `${this.imageName} ${data.counter}`
      
     }
    })
    el.querySelectorAll('a.figuretable').forEach(e=>{
      const id = e.getAttribute('href')?.slice(1,e.getAttribute('href')?.length)
      const data = Counter.getTableCounter(id||'')
      if(data){
        e.textContent = `${this.tableName} ${data.counter}`
      }
    })

  }

}
