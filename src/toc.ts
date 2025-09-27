import { Converter } from "./converter-node";
import type { NodeI } from "./types/type";


type PraHead =NodeI&{isPra:boolean};
export default class TocBuilder {


    private static counter =0;
    private static subCounter =0;
    private static subSubCounter = 0;

    private static converter:Converter =  new Converter;
    static render(nodes:NodeI[],praHead?:PraHead[]){

        let currentLevel = 1;
        let parents: HTMLUListElement[] = [];

        const pra = praHead ? praHead: [];

        [...pra,...nodes].forEach((n) => {
            console.log(n)
        if (n.type === "heading") {
            const { level } = n.attrs as { level: number };
            const li = document.createElement("li");
            const {attrs} = n as NodeI<{level:number,id:string}>
            const h = this.buildLink(n,{...attrs!,isPra:false})
            li.append(h)
            if (level > currentLevel) {
            const newUl = document.createElement("ul");
            parents[parents.length - 1]
                ?.lastElementChild
                ?.appendChild(newUl);
            parents.push(newUl);
            } else if (level < currentLevel) {
            parents.splice(level, parents.length - level);
            }

            currentLevel = level;
            parents[parents.length - 1]?.appendChild(li);
        }
        });

       const container = document.createElement('div')
        
        container.append(...parents)
        return container;


    }

    static buildLink(node:NodeI,{id,level,isPra}:{id:string,level:number,isPra?:boolean}){

        const heading = document.createElement(`h${level == 1 ? '2' :'3'}`)
        const a = document.createElement('a')

        const aNum = document.createElement('a')

        aNum.setAttribute('href',`#${id}`)
        const span = document.createElement('span')
        

        a.classList.add(isPra ? 'link-number-pra' : 'link-number')
        a.setAttribute('href',`#${id}`)
        a.classList.add('page-num')

        const text =    this.getText(node as NodeI<{level:number}>,isPra ||false)
        span.append(...text)

        a.append(span)


        heading.append(a,aNum)


        return heading;


    }

    static getText(node:NodeI<{level:number}>,isPra?:boolean){
        const {level} = node.attrs!
        let number;

            if (level ==1){

                this.counter++;
                this.subCounter = 0;
                number =  document.createTextNode(isPra ? '':this.counter+'.')
            }
            else if(level == 2){

                this.subSubCounter =0;
                ++this.subCounter;

                number =  document.createTextNode(this.counter+'.'+this.subCounter)
            }
            else{
                ++this.subSubCounter
                 number =  document.createTextNode(this.counter+'.'+this.subCounter+'.'+this.subSubCounter)
            }

            return [number,this.converter.parse(node)]

    }
}