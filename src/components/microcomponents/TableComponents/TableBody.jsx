import React from "react";

export default function TableBody({ columns, data, newRowIds = [] }) {
  return (
    <tbody className="divide-y divide-gray-200">
      {data.map((row, rowIndex) => {
        const rowId = row.recordId || row.id;
        const isNewRow = newRowIds.includes(rowId);
        
        return (
          <tr
            key={rowId || rowIndex}
            className={`
              hover:bg-gray-50 transition-all duration-300
              ${isNewRow ? "bg-[var(--accent-color)]/5 border-l-4 border-[var(--accent-color)]" : ""}
            `}
          >
            {columns.map((col) => (
              <td
                key={col.accessor}
                className={`
                  px-4 py-3 text-sm whitespace-nowrap
                  ${col.clickable ? "text-[var(--primary-color)] hover:text-blue-800 cursor-pointer" : "text-gray-800"}
                `}
                onClick={col.clickable ? () => col.onClick?.(row) : undefined}
              >
                {col.cell ? col.cell(row) : row[col.accessor] ?? "-"}
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  );
}