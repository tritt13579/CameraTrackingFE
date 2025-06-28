import { useState, useEffect } from "react";
import { apiService } from "../services/api";

export const useCameras = () => {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  
  // State cho modal thêm camera
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [addCameraLoading, setAddCameraLoading] = useState(false);
  const [addCameraForm, setAddCameraForm] = useState({
    name: "",
    rtsp_url: "",
    input_size_value: ""
  });

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCameras();
      setCameras(data);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu cameras:", err);
      setError("Không thể kết nối với server. Vui lòng kiểm tra lại backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCameraSelect = (camera) => {
    console.log(
      `Chuyển từ camera ${selectedCamera?.camera_id} sang camera ${camera.camera_id}`
    );

    setSelectedCamera(camera);
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

  const showToast = (message, type = "success") => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(message, type);
    } else {
      // Fallback to alert if toast is not available
      alert(message);
    }
  };

  const handleSubmitAddCamera = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!addCameraForm.name.trim() || !addCameraForm.rtsp_url.trim() || !addCameraForm.input_size_value.trim()) {
      showToast("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    const inputSizeValue = parseFloat(addCameraForm.input_size_value);
    if (isNaN(inputSizeValue) || inputSizeValue <= 0) {
      showToast("Input size value phải là số dương!", "error");
      return;
    }

    try {
      setAddCameraLoading(true);
      
      const newCamera = await apiService.addCamera({
        name: addCameraForm.name.trim(),
        rtsp_url: addCameraForm.rtsp_url.trim(),
        input_size_value: inputSizeValue
      });
      
      // Thêm camera mới vào state
      setCameras(prev => [...prev, newCamera]);
      
      // Đóng modal và reset form
      handleCloseModal();
      
      // Hiển thị toast thành công
      showToast("🎉 Camera đã được thêm thành công!", "success");
      
    } catch (err) {
      console.error("Lỗi khi thêm camera:", err);
      showToast(`❌ Lỗi khi thêm camera: ${err.message}`, "error");
    } finally {
      setAddCameraLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  return {
    cameras,
    loading,
    error,
    selectedCamera,
    setSelectedCamera,
    showAddCameraModal,
    addCameraLoading,
    addCameraForm,
    fetchCameras,
    handleCameraSelect,
    handleAddCamera,
    handleCloseModal,
    handleFormChange,
    handleSubmitAddCamera
  };
}; 