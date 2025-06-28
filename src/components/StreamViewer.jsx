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
        <p className="text-gray-500 text-sm">Chọn camera để xem stream</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h4 className="font-semibold text-gray-800">
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
          <span className={`text-sm ${getStreamStatusColor()}`}>
            {getStreamStatusText()}
          </span>
        </div>
      </div>

      <div className="bg-black rounded-lg flex-1 flex items-center justify-center overflow-hidden relative min-h-0">
        {/* Loading overlay khi đang kết nối hoặc chưa load xong ảnh */}
        {(streamStatus === "connecting" || (streamStatus === "connected" && !imageLoaded)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">{streamStatus === "connecting" ? "Đang kết nối stream..." : "Đang tải stream..."}</p>
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
          <div className="text-white text-center">
            <p className="text-red-400 mb-2 text-sm">Lỗi kết nối stream</p>
            <p className="text-xs text-gray-400 mb-3">{streamError}</p>
            <button
              onClick={onReconnect}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Thử kết nối lại
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
} 