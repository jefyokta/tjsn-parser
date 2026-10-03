import { Parser } from "../converter";
import { type NodeI } from "../types/type";

export class TableView {
    static render(node: NodeI) {
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const rows = node.content || [];
        // console.log(rows.length)
        const parser = new Parser();

        let headerEnd = 0;
        // console.log(rows.length)
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            const headers =
                row?.content?.filter(
                    (cell) => cell.type === "tableHeader"
                ) || [];
            //every cells must  be th to be a header row rn
            if ((headers.length !== (row?.content?.length || 0))) {
                // console.log("not header row %d, cell total %d, header total %d",index +1,row?.content?.length,headers.length)
                continue;
            }

            const maxRowspan = Math.max(
                ...headers.map(
                    (header) =>
                        Number(header.attrs?.rowspan) || 1
                )
            );

            headerEnd = Math.max(
                headerEnd,
                index + maxRowspan
            );
        }
    // console.log(headerEnd)
        for (let index = 0; index < rows.length; index++) {
            const rowEl = document.createElement("tr");

            parser.render(
                rows[index]?.content || [],
                rowEl
            );

            if (index < headerEnd) {
                thead.append(rowEl);
            } else {
                tbody.append(rowEl);
            }
        }

        const colGroup = this.getColGroup(rows);

        table.append(
            colGroup,
            thead,
            tbody
        );

        return table;
    }

    static getColGroup(rows: NodeI[]) {
        const maxGroup = rows.reduce(
            (longest, current) =>
                (current.content?.length || 0) >
                (longest.content?.length || 0)
                    ? current
                    : longest
        );

        const colGroup = document.createElement("colgroup");

        const cols = maxGroup?.content?.map((cell) => {
            const col = document.createElement("col");

            const width = cell.attrs?.colwidth?.[0];

            col.style.width = width ? `${width}px` : "auto";

            return col;
        });

        if (cols) {
            colGroup.append(...cols);
        }

        return colGroup;
    }

  



    static getCellAlignment(alignment?: string): string {
        return ["left", "center"].includes(alignment || "")
            ? (alignment as string)
            : "start";
    }
}