import { useState, useEffect, useRef, useCallback } from "react";

export default function CameraStream() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamStatus, setStreamStatus] = useState("disconnected"); // disconnected, connecting, connected, error
  const [streamError, setStreamError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false); // Thêm state để track việc load ảnh
  
  // Thêm state cho schedule times
  const [scheduleTimes, setScheduleTimes] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  
  // Thêm state cho tab navigation
  const [activeTab, setActiveTab] = useState("cameras"); // "cameras" hoặc "schedule"

  // Thêm state cho modal thêm camera
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [addCameraLoading, setAddCameraLoading] = useState(false);
  const [addCameraForm, setAddCameraForm] = useState({
    name: "",
    rtsp_url: "",
    input_size_value: ""
  });

  const wsRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    fetchCameras();
    fetchScheduleTimes();
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!selectedCamera) return;

    disconnectWebSocket();

    setStreamStatus("connecting");
    setStreamError(null);
    setImageLoaded(false); // Reset image loaded state
    
    // Reset img src để tránh hiển thị ảnh cũ
    if (imgRef.current) {
      imgRef.current.src = "";
    }

    const cameraId = selectedCamera.camera_id || 1;
    const wsUrl = `ws://127.0.0.1:8000/api/v1/ws/stream/${cameraId}`;

    console.log(`Đang kết nối WebSocket cho camera ${cameraId}: ${wsUrl}`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // Quan trọng: Set binaryType thành blob
      ws.binaryType = "blob";

      ws.onopen = () => {
        console.log(`WebSocket connected cho camera ${cameraId}`);
        setStreamStatus("connected");
      };

      ws.onmessage = event => {
        if (event.data instanceof Blob) {
          // Xử lý frame JPEG hoàn chỉnh từ backend
          handleMjpegFrame(event.data);
        } else {
          console.log("Received text message:", event.data);
        }
      };

      ws.onerror = error => {
        console.error(`WebSocket error cho camera ${cameraId}:`, error);
        setStreamStatus("error");
        setStreamError("Lỗi kết nối WebSocket");
        setImageLoaded(false);
      };

      ws.onclose = event => {
        console.log(
          `WebSocket disconnected cho camera ${cameraId}, code: ${event.code}, reason: ${event.reason}`
        );
        // Chỉ set về disconnected nếu không phải do chuyển camera
        if (event.code !== 1000 || event.reason !== "Camera changed") {
          setStreamStatus("disconnected");
        }
        setImageLoaded(false);
      };
    } catch (error) {
      console.error(`Error creating WebSocket cho camera ${cameraId}:`, error);
      setStreamStatus("error");
      setStreamError("Không thể tạo kết nối WebSocket");
      setImageLoaded(false);
    }
  }, [selectedCamera]);

  useEffect(() => {
    let isCancelled = false;
    const handleSwitch = async () => {
      disconnectWebSocket();
      if (selectedCamera && !isCancelled) {
        setTimeout(() => {
          if (!isCancelled) connectWebSocket();
        }, 300);
      }
    };
    handleSwitch();
    return () => {
      isCancelled = true;
      disconnectWebSocket();
    };
  }, [selectedCamera, connectWebSocket]);

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

  const disconnectWebSocket = () => {
    return new Promise(resolve => {
      if (wsRef.current) {
        console.log("Đang ngắt kết nối WebSocket...");

        wsRef.current.onclose = () => {
          console.log("WebSocket thực sự đã đóng.");
          resolve(); // Đợi đến khi đóng hoàn toàn
        };

        wsRef.current.close(1000, "Camera changed");
        wsRef.current = null;
      } else {
        resolve();
      }

      // Chỉ reset khi thực sự disconnect hoàn toàn, không set status về disconnected
      setStreamError(null);
      setImageLoaded(false);
      
      // Reset img src khi disconnect
      if (imgRef.current) {
        imgRef.current.src = "";
      }
    });
  };

  const handleMjpegFrame = blob => {
    if (!imgRef.current) return;

    try {
      const jpegBlob = new Blob([blob], { type: "image/jpeg" });
      const url = URL.createObjectURL(jpegBlob);

      // Set onload để track khi ảnh đã load xong
      imgRef.current.onload = () => {
        setImageLoaded(true);
        URL.revokeObjectURL(url);
      };
      
      // Set onerror để handle trường hợp lỗi
      imgRef.current.onerror = () => {
        setImageLoaded(false);
        URL.revokeObjectURL(url);
      };

      imgRef.current.src = url;
    } catch (error) {
      console.error("Error handling MJPEG frame:", error);
      setImageLoaded(false);
    }
  };

  const handleCameraSelect = camera => {
    console.log(
      `Chuyển từ camera ${selectedCamera?.camera_id} sang camera ${camera.camera_id}`
    );

    // Ngắt kết nối camera cũ trước khi chọn camera mới
    if (selectedCamera && selectedCamera.camera_id !== camera.camera_id) {
      disconnectWebSocket();
    }

    // Set status thành connecting ngay lập tức để tránh hiển thị "Chưa kết nối"
    setStreamStatus("connecting");
    setImageLoaded(false);
    if (imgRef.current) {
      imgRef.current.src = "";
    }

    setSelectedCamera(camera);
  };

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

  const fetchScheduleTimes = async () => {
    try {
      setScheduleLoading(true);
      const response = await fetch("http://127.0.0.1:8000/api/v1/schedule-times");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setScheduleTimes(data);
    } catch (err) {
      console.error("Lỗi khi tải schedule times:", err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const updateScheduleTime = async (scheduleTimeId, isActive) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/schedule-times/${scheduleTimeId}?is_active=${isActive}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Cập nhật state local
      setScheduleTimes(prev => 
        prev.map(schedule => 
          schedule.schedule_time_id === scheduleTimeId 
            ? { ...schedule, is_active: isActive }
            : schedule
        )
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật schedule time:", err);
    }
  };

  const formatTime = (timeString) => {
    // Chuyển đổi từ format "HH:MM:SS" sang "HH:MM"
    return timeString.substring(0, 5);
  };

  const handleAddCamera = () => {
    setShowAddCameraModal(true);
    setAddCameraForm({
      name: "",
      rtsp_url: "",
      input_size_value: ""
    });
  };

  const handleCloseModal = () => {
    setShowAddCameraModal(false);
    setAddCameraForm({
      name: "",
      rtsp_url: "",
      input_size_value: ""
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAddCameraForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAddCamera = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!addCameraForm.name.trim() || !addCameraForm.rtsp_url.trim() || !addCameraForm.input_size_value.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const inputSizeValue = parseFloat(addCameraForm.input_size_value);
    if (isNaN(inputSizeValue) || inputSizeValue <= 0) {
      alert("Input size value phải là số dương!");
      return;
    }

    try {
      setAddCameraLoading(true);
      
      const response = await fetch("http://127.0.0.1:8000/api/v1/cameras", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addCameraForm.name.trim(),
          rtsp_url: addCameraForm.rtsp_url.trim(),
          input_size_value: inputSizeValue
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const newCamera = await response.json();
      
      // Thêm camera mới vào state
      setCameras(prev => [...prev, newCamera]);
      
      // Đóng modal và reset form
      handleCloseModal();
      
      alert("Thêm camera thành công!");
      
    } catch (err) {
      console.error("Lỗi khi thêm camera:", err);
      alert(`Lỗi khi thêm camera: ${err.message}`);
    } finally {
      setAddCameraLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="font-bold mb-2 text-red-600">Lỗi kết nối</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchCameras}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Nửa màn hình bên trái - Danh sách camera và khung giờ chụp */}
      <div className="w-1/2 flex flex-col p-4 space-y-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab("cameras")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "cameras"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Danh sách Camera
            </button>
            <button
              onClick={() => setActiveTab("schedule")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "schedule"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Khung giờ chụp
            </button>
          </div>

          {/* Tab Content */}
          <div className="h-48">
            {activeTab === "cameras" ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800">Danh sách Camera</h3>
                  <button
                    onClick={handleAddCamera}
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
                        onClick={() => handleCameraSelect(camera)}
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
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800">Khung giờ chụp</h3>
                  {scheduleLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {scheduleTimes.length === 0 ? (
                    <p className="text-gray-500 text-sm">Không có khung giờ nào</p>
                  ) : (
                    scheduleTimes.map((schedule) => (
                      <div
                        key={schedule.schedule_time_id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm font-medium text-gray-700">
                          {formatTime(schedule.capture_time)}
                        </span>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={schedule.is_active}
                            onChange={(e) => updateScheduleTime(schedule.schedule_time_id, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            schedule.is_active ? 'bg-blue-600' : 'bg-gray-300'
                          }`}>
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              schedule.is_active ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stream video */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex-1 min-h-0">
          {selectedCamera ? (
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
                      onClick={connectWebSocket}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Thử kết nối lại
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500 text-sm">Chọn camera để xem stream</p>
            </div>
          )}
        </div>
      </div>

      {/* Nửa màn hình bên phải - Hello */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-blue-600 mb-4">Hello</h1>
          <p className="text-xl text-gray-600">cho tôi</p>
        </div>
      </div>

      {/* Modal thêm camera */}
      {showAddCameraModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Thêm Camera Mới</h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitAddCamera} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Camera *
                </label>
                <input
                  type="text"
                  name="name"
                  value={addCameraForm.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tên camera"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RTSP URL *
                </label>
                <input
                  type="text"
                  name="rtsp_url"
                  value={addCameraForm.rtsp_url}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="rtsp://username:password@ip:port/..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Input Size Value *
                </label>
                <input
                  type="number"
                  name="input_size_value"
                  value={addCameraForm.input_size_value}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="23.0"
                  step="0.1"
                  min="0"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={addCameraLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={addCameraLoading}
                >
                  {addCameraLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang thêm...
                    </div>
                  ) : (
                    "Thêm Camera"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}