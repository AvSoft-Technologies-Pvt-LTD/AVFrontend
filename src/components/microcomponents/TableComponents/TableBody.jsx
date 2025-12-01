import React from "react";

export default function TableBody({ columns, data, onCellClick, newRowIds = [],onRemoveNewRowId,  }) {
   const handleRowClick = (rowId) => {
    if (onRemoveNewRowId) {
      onRemoveNewRowId(rowId); // Call the parent function
    }
  };
  return (
    <tbody className="divide-y divide-gray-200">
      {data.map((row, rowIndex) => (
        <tr
          key={row.recordId || rowIndex}
          className={`hover:bg-blue-50 transition-colors duration-150 ${
            newRowIds.includes(row.recordId) ? "bg-blue-50/30 border-l-4 border-l-blue-500" : ""
          }`}
          onClick={() => handleRowClick(row.recordId)}
        >
          {columns.map((col) => (
            <td
              key={col.accessor}
              className={`px-4 py-2 text-sm ${
                col.clickable
                  ? "text-blue-600 cursor-pointer hover:text-blue-800 hover:underline font-medium"
                  : "text-gray-900"
              }`}
              onClick={col.clickable ? () => onCellClick?.(row, col) : undefined}
            >
              {col.cell ? col.cell(row) : row[col.accessor] ?? "-"}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
