const ErrorMessage = ({ error, onRetry, onClose, className = '' }) => {
  if (!error) return null

  return (
    <div className={`rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border-l-4 border-red-500 bg-red-50 ${className}`}>
      <div className="flex items-start sm:items-center justify-between">
        <div className="flex items-start sm:items-center min-w-0 flex-1">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">
            <span className="text-white text-xs">!</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-medium text-red-800">Error</h3>
            <p className="text-xs sm:text-sm text-red-600 mt-1 break-words">{error}</p>
          </div>
        </div>
        <div className="flex space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs sm:text-sm text-red-600 px-2 py-1 rounded touch-manipulation"
            >
              Retry
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs sm:text-sm text-red-600 px-2 py-1 rounded touch-manipulation"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage 