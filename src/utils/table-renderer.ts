import { Parser } from "../converter";
import { type NodeI } from "../types/type";

export class TableView {
    static render(node: NodeI) {
        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");

        const [th, td] = this.getCells(node.content || []);

        if (th.length) {
            thead.append(...th);
        }

        if (td.length) {
            tbody.append(...td);
        }

        const colGroup = this.getColGroup(node.content || []);

        table.append(colGroup, thead, tbody);

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

    static getCells(rows: NodeI[]) {
        const parser = new Parser();

        const ths: HTMLTableRowElement[] = [];
        const tds: HTMLTableRowElement[] = [];

        let headerRowsRemaining = 0;

        for (const row of rows) {
            const headers =
                row.content?.filter(
                    (cell) => cell.type === "tableHeader"
                ) || [];

            const hasHeader = headers.length > 0;

            if (hasHeader) {
                ths.push(this.renderRow(parser, row));

                const maxRowSpan = Math.max(
                    1,
                    ...headers.map(
                        (cell) => Number(cell.attrs?.rowspan) || 1
                    )
                );

                headerRowsRemaining = Math.max(
                    headerRowsRemaining,
                    maxRowSpan - 1
                );

                continue;
            }

            if (headerRowsRemaining > 0) {
                ths.push(this.renderRow(parser, row));
                headerRowsRemaining--;

                continue;
            }

            tds.push(this.renderRow(parser, row));
        }

        return [ths, tds] as const;
    }

    private static renderRow(
        parser: Parser,
        row: NodeI
    ): HTMLTableRowElement {
        const tr = document.createElement("tr");

        parser.render(row.content || [], tr);

        return tr;
    }

    static getCellAlignment(alignment?: string): string {
        return ["left", "center"].includes(alignment || "")
            ? (alignment as string)
            : "start";
    }
}