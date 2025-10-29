import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="w-full  text-[var(--primary-color)] rounded-lg flex items-center justify-between px-6 py-4">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-2 text-sm transition-colors ${
          currentPage === 1
            ? "text-[var(--primary-color)] cursor-not-allowed"
            : "hover:text-[var(--accent-color)]"
        }`}
      >
        <ChevronLeft className="w-4 h-4" /> Previous
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-2">
        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-1 text-sm hover:text-[var(--accent-color)]"
            >
              1
            </button>
            {pageNumbers[0] > 2 && (
              <span className="px-2 text-sm">...</span>
            )}
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`relative px-3 py-1 text-sm transition-colors ${
              currentPage === page
                ? "text-[var(--primary-color)] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-[var(--primary-color)]"
                : "hover:[var(--accent-color)]"
            }`}
          >
            {page}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-2 text-sm">...</span>
            )}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 text-sm hover:text-[var(--accent-color)]"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center gap-2 text-sm transition-colors ${
          currentPage === totalPages
            ? "text-[var(--primary-color)] cursor-not-allowed"
            : "hover:text-[var(--accent-color)]"
        }`}
      >
        Next <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;
