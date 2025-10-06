import { HeadingCollector } from "./collector/heading";
import { Converter } from "./converter-node";
import type { NodeI } from "./types/type";


type ULList ={
    level:number,
    children:ULList[],
    li?:HTMLLIElement
}



export class TocBuilder {

    private root;
    private converter;

    private counter =0;
    private subCounter = 0;
    private subSubCounter =0;

    private praHead:any[] = [];
    private afterHead:any[] = [];

    constructor (){
        this.root = document.createElement('div')
        this.converter = new Converter(['bold'])
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


    increseCounter(level?:number,pra?:boolean){
        if (level == 1) {
            if (!pra) {
                this.counter++
            }
            this.subCounter =0
            
        }
        if (level == 2) {
            this.subCounter++
            this.subSubCounter =0
            
        }
        if (level == 3) {
            this.subSubCounter++
            
        }

    }

    getCounter(level?:number,praHead?:boolean){
        if (level == 1) {
           
            return  praHead ?  '' : `${this.counter}. `

        }
        if (level == 2) {
            return `${this.counter}.${this.subCounter}. `

        }
        if (level == 3) {
            return `${this.counter}.${this.subCounter}.${this.subSubCounter}. `

            
        }

        return ''
    }

    buildLink(node:NodeI,counter:string,pra?:boolean,after?:boolean){

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
                tocItemNumber?.classList?.contains('toc-item-number') && tocItem.classList.remove('toc-item-number')
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
        const elList = node.content?.map(n=>{
              return  this.converter.parse(n)
            })
        tocItemNumber.append(document.createTextNode(counter),...(elList || [document.createTextNode('')]))

      }
   
     
     
     
        mainContent.append(tocItemNumber)
        tocItem.append(mainContent)
        spanWrapper.append(tocItem)
        pageNum.append(spanWrapper)

        const linkNumber = document.createElement('a')
        linkNumber.href = `#${node.attrs?.id}`
        linkNumber.classList.add(pra ? (after ? 'link-number': 'link-number-pra'):'link-number')


        h.append(pageNum,linkNumber)




      return h;

    }

    withPraHeading({text,id}:{text:string,id:string}){

        this.praHead.push({
            type:"heading",
            attrs:{
                level:1,
                id
            },
            content:[{
                type:"text",
                text
            }],
            pra:true
        })


    }

    withAfterHeading({text,id}:{text:string,id:string}){

        this.afterHead.push({
            type:"heading",
            attrs:{
                level:1,
                id
            },
            content:[{
                type:"text",
                text
            }],
            pra:true,
            after:true
        })
        

    }

    _render(nodes?:NodeI[]){
        const headings = [...this.praHead,...(nodes?.filter(n=>n.type == 'heading') || HeadingCollector.getAll()),...this.afterHead]

        const level1UL:ULList[]= []

        headings.forEach(h=>{
            const level = h.attrs?.level || 1
            this.increseCounter(level,h.pra || false)
            const li =document.createElement('li')
            li.append(this.buildLink(h,this.getCounter(level),h.pra,h.after || false))

            if (level ==1) {
                level1UL.push({level,children:[],li})
            }
            else if (level == 2) {
                if (level1UL.length ==0) {                    
                    level1UL.push({children:[],level:1})
                }
                const lastLevel1 = level1UL[level1UL.length-1] as ULList
                lastLevel1.children.push({level,li,children:[]})                                
            }
            else if(level == 3){
                if (level1UL.length ==0) {                    
                    level1UL.push({children:[],level:1})
                }
                const lastLevel1 = level1UL[level1UL.length-1] as ULList
                if (lastLevel1.children.length == 0) {
                    lastLevel1.children.push({level:2,children:[]})
                    
                }
                const lastLevel2 = lastLevel1.children[lastLevel1.children.length -1] as ULList

                lastLevel2.children.push({level,children:[],li})



            }
            
        })
        this.root.append(...this.toHtml(level1UL))
        return this.root
    }

    private toHtml(ulLists:ULList[]){

        return  ulLists.map(e=>{
            const ul = document.createElement('ul')
            
             e.li && ul.append(e.li)
             if (e.children.length !== 0 && e.level !==3) {
              const chs =  this.toHtml(e.children)
              ul.append(...chs)                
             }

             return ul
        })


    }

  
}

