import { Parser } from "../converter";
import { type NodeI } from "../types/type";



export class TableView {


    static render(node:NodeI){
        const table = document.createElement('table');
        const thead = document.createElement('thead')
        const tbody = document.createElement('tbody')

        const [th,td] = this.getCells(node.content || [])
        th && thead.append(...th)
        td && tbody.append(...td)
        const colGroup = this.getColGroup(node.content || [])
        table.append(colGroup,thead,tbody)

        return table
    }
    static getColGroup(rows:NodeI[]){
            const maxGroup = rows?.reduce((longest,current)=> current.content?.length ||0   > longest.content!.length  || 0? current : longest) 
            const colGroup = document.createElement('colgroup')

             const cols =  maxGroup &&  maxGroup.content?.map((cell)=>{
                const col = document.createElement('col')
                let width = cell.attrs?.colWidth?.pop() ;
                width = width ? width + 'px' : 'auto'
             

                col.style.width = width
                return col
                
            })
            cols && colGroup.append(...cols)

            return colGroup


    }

    static getCells(rows:NodeI[]){

      const parser= new Parser
         const trHead =    rows
                            .filter((r)=> r.content?.find(c=>c.type == 'tableHeader'))

          const ths = trHead.map((t)=>{

            const tr = document.createElement('tr')
            parser.render(t.content||[],tr)
              
              return tr
          })
                      
         const trCell =    rows
                            .filter((r)=> !r.content?.find(c=>c.type == 'tableHeader'))
          const tds =trCell.map((t)=>{

            const tr = document.createElement('tr')
            parser.render(t.content||[],tr)

              return tr
          })
                      
                      
                            

           return [ths,tds]
    }

    static getCellAlignment(alignment?: string): string {
    switch (alignment) {
      case "left":
        return "start"
      case "center":
        return "center"
      default:
        return "start"
    }
  }



}