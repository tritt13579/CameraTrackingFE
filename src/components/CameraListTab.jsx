export default function CameraListTab({ 
  cameras, 
  selectedCamera, 
  onCameraSelect, 
  onAddCamera 
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
        <h3 className="font-bold text-base sm:text-lg text-gray-800">Danh sách Camera</h3>
        <button
          onClick={onAddCamera}
          className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto"
        >
          <span className="hidden sm:inline">+ Thêm Camera</span>
          <span className="sm:hidden">+ Thêm</span>
        </button>
      </div>
      <div className="flex-1 space-y-1.5 sm:space-y-2 overflow-y-auto">
        {cameras.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm text-center">Không có camera nào</p>
          </div>
        ) : (
          cameras.map((camera, index) => (
            <div
              key={index}
              onClick={() => onCameraSelect(camera)}
              className={`p-2.5 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 text-sm sm:text-base ${
                selectedCamera?.camera_id === camera.camera_id
                  ? "bg-blue-100 border-l-4 border-blue-500 shadow-sm"
                  : "bg-gray-50 hover:bg-gray-100 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">
                  {camera.name || camera.camera_id || index + 1}
                </span>
                {selectedCamera?.camera_id === camera.camera_id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 