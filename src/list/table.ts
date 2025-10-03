import Counter from "../collector/counter"


export default class TableList {
    constructor(private name:string){}
    render(appendTo:HTMLElement){
        const root = document.createElement('ul')
        Counter.getTables().forEach(e=>{
            const li = document.createElement('li')
            const h = document.createElement('h3')
            const pageNum = document.createElement('a')
            pageNum.href =`#${e.id}`
            pageNum.classList.add('page-num')
            const span = document.createElement('span')
            const tocItem = document.createElement('span')
            tocItem.classList.add('toc-item')

            const textWrapper = document.createElement("span")

            const counter = document.createTextNode(`${this.name} ${e.counter}`)
            textWrapper.append(counter,document.createTextNode(" "), ...e.caption)
            tocItem.append(textWrapper)

            span.append(tocItem)
            pageNum.append(span)            
            const linkNumber = document.createElement('a')
            linkNumber.classList.add('link-number')
            linkNumber.href =`#${e.id}`
            h.append(pageNum,linkNumber)
            li.append(h)
            root.append(li)
        })

        appendTo.append(root)
    }
}