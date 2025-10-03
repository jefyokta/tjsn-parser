

export default class ImageList {
    private images:{text:HTMLElement[],id:string}[] =[];
    constructor(private selector="a[data-type='imageFigure']"){}
    private  collect(){
        document.querySelectorAll(this.selector).forEach(e=>{
            const caption = e.lastChild
            const id = e.id
            let textNode:HTMLElement[]  =[];
            caption?.childNodes.forEach(e=>{
                textNode.push(e as HTMLElement)
            })
            this.images.push({text:textNode,id})
        })
    }

    render(appendTo:HTMLElement){
        this.collect()
        const root = document.createElement('ul')
        this.images.forEach(e=>{
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