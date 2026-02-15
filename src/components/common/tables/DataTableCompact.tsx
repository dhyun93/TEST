import React from "react"

export type Column = { key: string; label: string; minWidth?: string | number; renderCell?: (row: DataRow, col: Column, rowIdx: number) => React.ReactNode; align?: "left" | "center" | "right" }
export type DataRow = { id?: number | string; [key: string]: React.ReactNode }
interface DataTableProps {
  columns: Column[]
  data: DataRow[]
}

const headerFontStyle: React.CSSProperties = { fontWeight: 600, color: "#666666", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }
const bodyFontStyle: React.CSSProperties = { fontWeight: 500, color: "#333639", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }

const DataTableCompact: React.FC<DataTableProps> = ({ columns, data }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse min-w-[600px] md:min-w-auto">
      <thead>
        <tr className="h-[33px] md:h-[30px]" style={{ background: "#F7F8FA", borderTop: "1.9px solid #161616", borderBottom: "1px solid #CCCCCC" }}>
          {columns.map((col, idx) => (
            <th
              key={col.key}
              className="px-1.5 sm:px-3 py-0 align-middle text-[11px] sm:text-xs md:text-sm text-center"
              style={{
                minWidth: typeof col.minWidth === "number" ? Math.max(col.minWidth, 60) : col.minWidth || 60,
                maxWidth: 300,
                borderRight: idx === columns.length - 1 ? "none" : "1px solid #CCCCCC",
                background: "#EFEFF3",
                ...headerFontStyle,
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr
            key={row.id ?? rowIdx}
            className="h-[33px]"
            style={{ background: "#fff" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#FBFBFB")}
            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
          >
            {columns.map((col, colIdx) => (
              <td
                key={col.key}
                className={`px-1.5 sm:px-3 py-0 align-middle text-[11px] sm:text-xs md:text-sm font-medium ${col.align === "left" ? "text-left" : col.align === "right" ? "text-right" : "text-center"}`}
                style={{
                  minWidth: typeof col.minWidth === "number" ? Math.max(col.minWidth, 60) : col.minWidth || 60,
                  maxWidth: 300,
                  borderRight: colIdx === columns.length - 1 ? "none" : "1px solid #CCCCCC",
                  borderBottom: "1px solid #CCCCCC",
                  ...bodyFontStyle,
                }}
                title={typeof row[col.key] === "string" ? (row[col.key] as string) : undefined}
              >
                {col.renderCell ? col.renderCell(row, col, rowIdx) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default DataTableCompact
