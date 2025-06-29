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
import SettlementChart from "./SettlementChart";

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
    <div className="min-h-screen bg-gray-50">
      {/* Toast Container */}
      <ToastContainer />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Hệ thống Camera Tracking
          </h1>
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
              <span>Camera đang chọn: {selectedCamera?.camera_id || 'Chưa chọn'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Left Panel - Camera List & Stream */}
        <div className="w-full lg:w-1/2 flex flex-col p-2 sm:p-4 space-y-2 sm:space-y-4">
          {/* Tab Navigation & Camera List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 flex-shrink-0">
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 flex-1 min-h-48">
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

        {/* Right Panel - Settlement Chart */}
        <div className="w-full lg:w-1/2 p-2 sm:p-4">
          <SettlementChart />
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