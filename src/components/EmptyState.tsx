'use client';

interface EmptyStateProps {
  message?: string;
  resetFilters?: () => void;
}

export default function EmptyState({
  message = "No cars found matching your criteria",
  resetFilters
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
        {message}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-md mb-4">
        Try adjusting your filters or search criteria to find what you&apos;re looking for.
      </p>

      {resetFilters && (
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-300 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Filters
        </button>
      )}
    </div>
  );
}
