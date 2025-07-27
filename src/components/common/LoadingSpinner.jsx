const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8',
    lg: 'w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12'
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-primary rounded-full animate-spin`}></div>
      {text && <span className="text-xs sm:text-sm text-text-secondary">{text}</span>}
    </div>
  )
}

export default LoadingSpinner 