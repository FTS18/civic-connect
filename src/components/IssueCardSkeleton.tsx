const IssueCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border-l-4 border-gray-300 dark:border-gray-600 shadow-lg animate-pulse">
      <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 mb-3">
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      </div>
      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      </div>
    </div>
  );
};

export default IssueCardSkeleton;
