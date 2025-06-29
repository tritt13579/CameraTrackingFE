export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm sm:text-lg font-medium">Đang tải hệ thống...</p>
        <p className="text-gray-500 text-xs sm:text-sm mt-2">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
} 