import { HeadingCollector } from "./collector/heading";
import { Converter } from "./converter-node";
import type { NodeI } from "./types/type";




export class TocBuilder {


    private root;
    private converter;

    private counter =0;
    private subCounter = 0;
    private subSubCounter =0;


    constructor (){
        this.root = document.createElement('div')
        this.converter = new Converter
        const h1 = document.createElement('h1')
        h1.id='toc'
        h1.setAttribute('style','text-align:center;text-transform:capitalize;')
        h1.textContent = "DAFTAR ISI"
        this.root.append(h1)
    }
render() {
    const headings = HeadingCollector.getAll();
    const root = this.root;
    const stack: { level: number, ul: HTMLUListElement }[] = [];

    const rootUl = document.createElement('ul');
    root.append(rootUl);
    stack.push({ level: 0, ul: rootUl });

    headings.forEach(h => {
        const level = h.attrs?.level || 1;
        this.increseCounter(level);

        const li = document.createElement('li');
        li.append(this.buildLink(h, this.getCounter(level)));

        
        if (level > stack[stack.length - 1]!.level) {
            const newUl = document.createElement('ul');
            stack[stack.length - 1]!.ul.append(li); 
            stack[stack.length - 1]!.ul.append(newUl); 
            stack.push({ level, ul: newUl }); 
        }
        
        else if (level === stack[stack.length - 1]!.level) {
            stack[stack.length - 1]!.ul.append(li);
        }
        
        else {
            while (stack.length > 0 && stack[stack.length - 1]!.level >= level) {
                stack.pop();
            }
            const parentUl = stack[stack.length - 1]!.ul;
            parentUl.append(li);

            const newUl = document.createElement('ul');
            parentUl.append(newUl);
            stack.push({ level, ul: newUl });
        }
    });

    return root;
}


    increseCounter(level?:number){
        if (level == 1) {
            this.counter++
            
        }
        if (level == 2) {
            this.subCounter++
            
        }
        if (level == 3) {
            this.subSubCounter++
            
        }

    }

    getCounter(level?:number){
        if (level == 1) {
            return `${this.counter}.`

        }
        if (level == 2) {
            return `${this.counter}.${this.subCounter}.`

        }
        if (level == 3) {
            return `${this.counter}.${this.subCounter}.${this.subSubCounter}.`

            
        }

        return ''
    }

    buildLink(node:NodeI,counter:string,pra?:boolean){

      const h =  document.createElement(`h${node.attrs?.level == 1 ? 2 : 3}`)

      const pageNum = document.createElement('a')
      pageNum.href = `#${node.attrs?.id}`
      pageNum.classList.add('page-num')

      const spanWrapper = document.createElement('span')

      const tocItem = document.createElement('span')
      tocItem.classList.add('toc-item')

     let mainContent = document.createElement('span')
      let tocItemNumber =document.createElement('span')
      tocItemNumber.classList.add('toc-item-number')
      if (node.attrs?.level == 1) {
             mainContent = document.createElement('b')
             if (pra) {
              if(node.content  && node.content[0]){ 
                tocItemNumber =  this.converter.text(node.content[0]) as any
                tocItemNumber.classList.contains('toc-item-number') && tocItem.classList.remove('toc-item-number')
                }
                
             }else{
                let text ;
                if(node.content  && node.content[0]){ 
                    text = this.converter.text(node.content[0])
               
                }
                tocItemNumber.append(document.createTextNode(counter),text || document.createTextNode(''))
             }     
      }
      else{
        let text ;
        if(node.content  && node.content[0]){ 
        text = this.converter.text(node.content[0])
               
        }
        tocItemNumber.append(document.createTextNode(counter),text || document.createTextNode(''))

      }
   
     
     
     
        mainContent.append(tocItemNumber)
        tocItem.append(mainContent)
        spanWrapper.append(tocItem)
        pageNum.append(spanWrapper)

        const linkNumber = document.createElement('a')
        linkNumber.href = `#${node.attrs?.id}`
        linkNumber.classList.add('link-number')


        h.append(pageNum,linkNumber)




      return h;

    }
}

