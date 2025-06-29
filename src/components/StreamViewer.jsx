export default function StreamViewer({ 
  selectedCamera, 
  streamStatus, 
  streamError, 
  imageLoaded, 
  imgRef, 
  onReconnect 
}) {
  const getStreamStatusText = () => {
    switch (streamStatus) {
      case "connecting":
        return "Đang kết nối...";
      case "connected":
        return imageLoaded ? "Đã kết nối" : "Đang tải stream...";
      case "error":
        return "Lỗi kết nối";
      default:
        return "Chưa kết nối";
    }
  };

  const getStreamStatusColor = () => {
    switch (streamStatus) {
      case "connecting":
        return "text-yellow-600";
      case "connected":
        return imageLoaded ? "text-green-600" : "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (!selectedCamera) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm sm:text-base">Chọn camera để xem stream</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 flex-shrink-0 space-y-2 sm:space-y-0">
        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
          Stream: Camera {selectedCamera.camera_id || selectedCamera.name}
        </h4>
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              streamStatus === "connected" && imageLoaded
                ? "bg-green-500"
                : streamStatus === "connecting" || (streamStatus === "connected" && !imageLoaded)
                  ? "bg-yellow-500"
                  : streamStatus === "error"
                    ? "bg-red-500"
                    : "bg-gray-500"
            }`}
          ></div>
          <span className={`text-xs sm:text-sm ${getStreamStatusColor()}`}>
            {getStreamStatusText()}
          </span>
        </div>
      </div>

      <div className="bg-black rounded-lg flex-1 flex items-center justify-center overflow-hidden relative min-h-0">
        {/* Loading overlay khi đang kết nối hoặc chưa load xong ảnh */}
        {(streamStatus === "connecting" || (streamStatus === "connected" && !imageLoaded)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
            <div className="text-white text-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-3"></div>
              <p className="text-xs sm:text-sm">{streamStatus === "connecting" ? "Đang kết nối stream..." : "Đang tải stream..."}</p>
            </div>
          </div>
        )}

        {streamStatus === "connected" ? (
          <img
            ref={imgRef}
            width="640"
            height="480"
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            alt="Camera Stream"
          />
        ) : streamStatus === "error" ? (
          <div className="text-white text-center p-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-400 mb-2 text-sm sm:text-base font-medium">Lỗi kết nối stream</p>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 max-w-xs mx-auto">{streamError}</p>
            <button
              onClick={onReconnect}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              Thử kết nối lại
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
} 