export default function CameraListTab({ 
  cameras, 
  selectedCamera, 
  onCameraSelect, 
  onAddCamera 
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-gray-800">Danh sách Camera</h3>
        <button
          onClick={onAddCamera}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
        >
          + Thêm Camera
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {cameras.length === 0 ? (
          <p className="text-gray-500 text-sm">Không có camera nào</p>
        ) : (
          cameras.map((camera, index) => (
            <div
              key={index}
              onClick={() => onCameraSelect(camera)}
              className={`p-2 rounded cursor-pointer transition-colors text-sm ${
                selectedCamera?.camera_id === camera.camera_id
                  ? "bg-blue-100 border-l-4 border-blue-500"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <span className="font-medium">
                Camera {camera.camera_id || camera.name || index + 1}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 