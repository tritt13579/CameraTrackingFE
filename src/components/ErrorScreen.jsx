export default function ErrorScreen({ error, onRetry }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="font-bold mb-2 sm:mb-3 text-red-600 text-lg sm:text-xl">Lỗi kết nối</h3>
        <p className="text-red-500 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium shadow-lg hover:shadow-xl"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
} 