import { useState } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useCameras } from "../hooks/useCameras";
import { useScheduleTimes } from "../hooks/useScheduleTimes";
import TabNavigation from "./TabNavigation";
import CameraListTab from "./CameraListTab";
import ScheduleTab from "./ScheduleTab";
import StreamViewer from "./StreamViewer";
import AddCameraModal from "./AddCameraModal";
import LoadingScreen from "./LoadingScreen";
import ErrorScreen from "./ErrorScreen";
import ToastContainer from "./ToastContainer";

export default function CameraStream() {
  // State cho tab navigation
  const [activeTab, setActiveTab] = useState("cameras"); // "cameras" hoặc "schedule"

  // Custom hooks
  const {
    cameras,
    loading,
    error,
    selectedCamera,
    setSelectedCamera,
    showAddCameraModal,
    addCameraLoading,
    addCameraForm,
    fetchCameras,
    handleAddCamera,
    handleCloseModal,
    handleFormChange,
    handleSubmitAddCamera
  } = useCameras();

  const {
    scheduleTimes,
    scheduleLoading,
    updateScheduleTime,
    formatTime
  } = useScheduleTimes();

  const {
    streamStatus,
    streamError,
    imageLoaded,
    imgRef,
    connectWebSocket
  } = useWebSocket(selectedCamera);

  // Xử lý chọn camera với logic WebSocket
  const handleCameraSelectWithWebSocket = (camera) => {
    console.log(
      `Chuyển từ camera ${selectedCamera?.camera_id} sang camera ${camera.camera_id}`
    );

    // Set status thành connecting ngay lập tức để tránh hiển thị "Chưa kết nối"
    setSelectedCamera(camera);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={fetchCameras} />;
  }

  return (
    <div className="h-screen flex">
      {/* Toast Container */}
      <ToastContainer />

      {/* Nửa màn hình bên trái - Danh sách camera và khung giờ chụp */}
      <div className="w-1/2 flex flex-col p-4 space-y-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          <div className="h-48">
            {activeTab === "cameras" ? (
              <CameraListTab
                cameras={cameras}
                selectedCamera={selectedCamera}
                onCameraSelect={handleCameraSelectWithWebSocket}
                onAddCamera={handleAddCamera}
              />
            ) : (
              <ScheduleTab
                scheduleTimes={scheduleTimes}
                scheduleLoading={scheduleLoading}
                onUpdateScheduleTime={updateScheduleTime}
                formatTime={formatTime}
              />
            )}
          </div>
        </div>

        {/* Stream video */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex-1 min-h-0">
          <StreamViewer
            selectedCamera={selectedCamera}
            streamStatus={streamStatus}
            streamError={streamError}
            imageLoaded={imageLoaded}
            imgRef={imgRef}
            onReconnect={connectWebSocket}
          />
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
      <AddCameraModal
        showModal={showAddCameraModal}
        formData={addCameraForm}
        loading={addCameraLoading}
        onClose={handleCloseModal}
        onSubmit={handleSubmitAddCamera}
        onChange={handleFormChange}
      />
    </div>
  );
}