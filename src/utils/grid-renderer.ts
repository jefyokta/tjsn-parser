import type { NodeI } from "../types/type";
import { TableView } from "./table-renderer";

export class GridView extends TableView{
    static override render(node: NodeI): HTMLTableElement {
        const table = document.createElement('table');
        const tbody = document.createElement('tbody')
        const [_,td] = this.getCells(node.content || [])
        td && tbody.append(...td)
        const colGroup = this.getColGroup(node.content || [])
        table.append(colGroup,tbody)

        return table
    }
}