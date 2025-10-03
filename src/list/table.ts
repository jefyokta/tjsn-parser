

export default class TableList {
    private tables:{text:HTMLElement[],id:string}[] =[];
    constructor(private selector="[data-type='figureTable']"){}
    private  collect(){
        document.querySelectorAll(this.selector).forEach(e=>{
            const caption = e.firstChild
            const id = e.id
            let textNode:HTMLElement[]  =[];
            caption?.childNodes.forEach(e=>{
                textNode.push(e as HTMLElement)
            })
            this.tables.push({text:textNode,id})
        })
    }

    render(appendTo:HTMLElement){
        this.collect()
        const root = document.createElement('ul')
        this.tables.forEach(e=>{
            const li = document.createElement('li')
            const h = document.createElement('h3')
            const pageNum = document.createElement('a')
            pageNum.classList.add('page-num')
            const span = document.createElement('span')
            pageNum.append(span)
            const linkNumber = document.createElement('a')
            linkNumber.classList.add('link-number')
            h.append(pageNum,linkNumber)
            li.append(h)
            root.append(li)
        })

        appendTo.append(root)
    }
}