import { useState, useEffect } from "react";

export default function CameraList() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/v1/cameras");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCameras(data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu cameras:", err);
      setError("Không thể kết nối với server. Vui lòng kiểm tra lại backend.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg m-4">
        <h3 className="font-bold mb-2">Lỗi kết nối</h3>
        <p className="text-red-500">{error}</p>
        <button onClick={fetchCameras} className="mt-2 px-4 py-2 rounded">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách Cameras</h2>
      {cameras.length === 0 ? (
        <p className="">Không có camera nào được tìm thấy.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cameras.map((camera, index) => (
            <div key={index} className="p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">
                Camera {camera.id || index + 1}
              </h3>
              <div className="space-y-1 text-sm">
                {Object.entries(camera).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="font-medium">{key}:</span>
                    <span className="">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={fetchCameras}
        className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
      >
        Làm mới dữ liệu
      </button>
    </div>
  );
}
