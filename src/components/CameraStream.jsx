// import { useState, useEffect, useRef, useCallback } from "react";

// export default function CameraStream() {
//   const [cameras, setCameras] = useState([]);
//   const [selectedCamera, setSelectedCamera] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [streamStatus, setStreamStatus] = useState("disconnected"); // disconnected, connecting, connected, error
//   const [streamError, setStreamError] = useState(null);

//   const wsRef = useRef(null);
//   const imgRef = useRef(null);

//   useEffect(() => {
//     fetchCameras();
//   }, []);

//   const connectWebSocket = useCallback(() => {
//     if (!selectedCamera) return;

//     disconnectWebSocket();

//     setStreamStatus("connecting");
//     setStreamError(null);

//     const cameraId = selectedCamera.camera_id || 1;
//     const wsUrl = `ws://127.0.0.1:8000/api/v1/ws/stream/${cameraId}`;

//     console.log(`Đang kết nối WebSocket cho camera ${cameraId}: ${wsUrl}`);

//     try {
//       const ws = new WebSocket(wsUrl);
//       wsRef.current = ws;

//       // Quan trọng: Set binaryType thành blob
//       ws.binaryType = "blob";

//       ws.onopen = () => {
//         console.log(`WebSocket connected cho camera ${cameraId}`);
//         setStreamStatus("connected");
//       };

//       ws.onmessage = event => {
//         if (event.data instanceof Blob) {
//           // Xử lý frame JPEG hoàn chỉnh từ backend
//           handleMjpegFrame(event.data);
//         } else {
//           console.log("Received text message:", event.data);
//         }
//       };

//       ws.onerror = error => {
//         console.error(`WebSocket error cho camera ${cameraId}:`, error);
//         setStreamStatus("error");
//         setStreamError("Lỗi kết nối WebSocket");
//       };

//       ws.onclose = event => {
//         console.log(
//           `WebSocket disconnected cho camera ${cameraId}, code: ${event.code}, reason: ${event.reason}`
//         );
//         setStreamStatus("disconnected");
//       };
//     } catch (error) {
//       console.error(`Error creating WebSocket cho camera ${cameraId}:`, error);
//       setStreamStatus("error");
//       setStreamError("Không thể tạo kết nối WebSocket");
//     }
//   }, [selectedCamera]);

//   useEffect(() => {
//     let isCancelled = false;
//     const handleSwitch = async () => {
//       disconnectWebSocket();
//       if (selectedCamera && !isCancelled) {
//         setTimeout(() => {
//           if (!isCancelled) connectWebSocket();
//         }, 300);
//       }
//     };
//     handleSwitch();
//     return () => {
//       isCancelled = true;
//       disconnectWebSocket();
//     };
//   }, [selectedCamera, connectWebSocket]);

//   const fetchCameras = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("http://127.0.0.1:8000/api/v1/cameras");

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       setCameras(data);
//       setError(null);
//     } catch (err) {
//       console.error("Lỗi khi tải dữ liệu cameras:", err);
//       setError("Không thể kết nối với server. Vui lòng kiểm tra lại backend.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const disconnectWebSocket = () => {
//     return new Promise(resolve => {
//       if (wsRef.current) {
//         console.log("Đang ngắt kết nối WebSocket...");

//         wsRef.current.onclose = () => {
//           console.log("WebSocket thực sự đã đóng.");
//           resolve(); // Đợi đến khi đóng hoàn toàn
//         };

//         wsRef.current.close(1000, "Camera changed");
//         wsRef.current = null;
//       } else {
//         resolve();
//       }

//       setStreamStatus("disconnected");
//       setStreamError(null);
//     });
//   };

//   const handleMjpegFrame = blob => {
//     if (!imgRef.current) return;

//     try {
//       const jpegBlob = new Blob([blob], { type: "image/jpeg" });
//       const url = URL.createObjectURL(jpegBlob);

//       imgRef.current.src = url;
//       setTimeout(() => URL.revokeObjectURL(url), 100);
//     } catch (error) {
//       console.error("Error handling MJPEG frame:", error);
//     }
//   };

//   const handleCameraSelect = camera => {
//     console.log(
//       `Chuyển từ camera ${selectedCamera?.camera_id} sang camera ${camera.camera_id}`
//     );

//     // Ngắt kết nối camera cũ trước khi chọn camera mới
//     if (selectedCamera && selectedCamera.camera_id !== camera.camera_id) {
//       disconnectWebSocket();
//     }

//     setSelectedCamera(camera);
//   };

//   const getStreamStatusText = () => {
//     switch (streamStatus) {
//       case "connecting":
//         return "Đang kết nối...";
//       case "connected":
//         return "Đã kết nối";
//       case "error":
//         return "Lỗi kết nối";
//       default:
//         return "Chưa kết nối";
//     }
//   };

//   const getStreamStatusColor = () => {
//     switch (streamStatus) {
//       case "connecting":
//         return "text-yellow-600";
//       case "connected":
//         return "text-green-600";
//       case "error":
//         return "text-red-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         <span className="ml-2">Đang tải...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <h3 className="font-bold mb-2 text-red-600">Lỗi kết nối</h3>
//           <p className="text-red-500 mb-4">{error}</p>
//           <button
//             onClick={fetchCameras}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex">
//       {/* Nửa màn hình bên trái - Danh sách camera và stream */}
//       <div className="w-1/2 flex flex-col">
//         {/* Danh sách camera ở góc trên bên trái */}
//         <div className="p-4 border-b border-gray-200">
//           <h3 className="font-bold text-lg mb-3">Danh sách Camera</h3>
//           <div className="space-y-2 max-h-32 overflow-y-auto">
//             {cameras.length === 0 ? (
//               <p className="text-gray-500">Không có camera nào</p>
//             ) : (
//               cameras.map((camera, index) => (
//                 <div
//                   key={index}
//                   onClick={() => handleCameraSelect(camera)}
//                   className={`p-2 rounded cursor-pointer transition-colors ${
//                     selectedCamera?.camera_id === camera.camera_id
//                       ? "bg-blue-100 border-l-4 border-blue-500"
//                       : "bg-gray-50 hover:bg-gray-100"
//                   }`}
//                 >
//                   <span className="font-medium">
//                     Camera {camera.camera_id || camera.name || index + 1}
//                   </span>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Stream video bên dưới */}
//         <div className="flex-1 p-4">
//           {selectedCamera ? (
//             <div className="h-full">
//               <div className="flex items-center justify-between mb-3">
//                 <h4 className="font-semibold">
//                   Stream: Camera{" "}
//                   {selectedCamera.camera_id || selectedCamera.name}
//                 </h4>
//                 <div className="flex items-center space-x-2">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       streamStatus === "connected"
//                         ? "bg-green-500"
//                         : streamStatus === "connecting"
//                           ? "bg-yellow-500"
//                           : streamStatus === "error"
//                             ? "bg-red-500"
//                             : "bg-gray-500"
//                     }`}
//                   ></div>
//                   <span className={`text-sm ${getStreamStatusColor()}`}>
//                     {getStreamStatusText()}
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-black rounded-lg h-full flex items-center justify-center overflow-hidden">
//                 {streamStatus === "connected" ? (
//                   <img
//                     ref={imgRef}
//                     width="640"
//                     height="480"
//                     className="max-w-full max-h-full object-contain"
//                     alt="Camera Stream"
//                   />
//                 ) : streamStatus === "error" ? (
//                   <div className="text-white text-center">
//                     <p className="text-red-400 mb-2">Lỗi kết nối stream</p>
//                     <p className="text-sm text-gray-400 mb-3">{streamError}</p>
//                     <button
//                       onClick={connectWebSocket}
//                       className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                     >
//                       Thử kết nối lại
//                     </button>
//                   </div>
//                 ) : streamStatus === "connecting" ? (
//                   <div className="text-white text-center">
//                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
//                     <p>Đang kết nối stream...</p>
//                   </div>
//                 ) : (
//                   <div className="text-white text-center">
//                     <p>Chưa kết nối stream</p>
//                     <p className="text-sm text-gray-400 mt-2">
//                       ws://127.0.0.1:8000/api/v1/ws/stream/
//                       {selectedCamera.camera_id}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
//               <p className="text-gray-500">Chọn camera để xem stream</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Nửa màn hình bên phải - Hello */}
//       <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="text-center">
//           <h1 className="text-6xl font-bold text-blue-600 mb-4">Hello</h1>
//           <p className="text-xl text-gray-600">cho tôi</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect, useRef, useCallback } from "react";

// export default function CameraStream() {
//   const [cameras, setCameras] = useState([]);
//   const [selectedCamera, setSelectedCamera] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [streamStatus, setStreamStatus] = useState("disconnected"); // disconnected, connecting, connected, error
//   const [streamError, setStreamError] = useState(null);
//   const [imageLoaded, setImageLoaded] = useState(false); // Thêm state để track việc load ảnh

//   const wsRef = useRef(null);
//   const imgRef = useRef(null);

//   useEffect(() => {
//     fetchCameras();
//   }, []);

//   const connectWebSocket = useCallback(() => {
//     if (!selectedCamera) return;

//     disconnectWebSocket();

//     setStreamStatus("connecting");
//     setStreamError(null);
//     setImageLoaded(false); // Reset image loaded state
    
//     // Reset img src để tránh hiển thị ảnh cũ
//     if (imgRef.current) {
//       imgRef.current.src = "";
//     }

//     const cameraId = selectedCamera.camera_id || 1;
//     const wsUrl = `ws://127.0.0.1:8000/api/v1/ws/stream/${cameraId}`;

//     console.log(`Đang kết nối WebSocket cho camera ${cameraId}: ${wsUrl}`);

//     try {
//       const ws = new WebSocket(wsUrl);
//       wsRef.current = ws;

//       // Quan trọng: Set binaryType thành blob
//       ws.binaryType = "blob";

//       ws.onopen = () => {
//         console.log(`WebSocket connected cho camera ${cameraId}`);
//         setStreamStatus("connected");
//       };

//       ws.onmessage = event => {
//         if (event.data instanceof Blob) {
//           // Xử lý frame JPEG hoàn chỉnh từ backend
//           handleMjpegFrame(event.data);
//         } else {
//           console.log("Received text message:", event.data);
//         }
//       };

//       ws.onerror = error => {
//         console.error(`WebSocket error cho camera ${cameraId}:`, error);
//         setStreamStatus("error");
//         setStreamError("Lỗi kết nối WebSocket");
//         setImageLoaded(false);
//       };

//       ws.onclose = event => {
//         console.log(
//           `WebSocket disconnected cho camera ${cameraId}, code: ${event.code}, reason: ${event.reason}`
//         );
//         setStreamStatus("disconnected");
//         setImageLoaded(false);
//       };
//     } catch (error) {
//       console.error(`Error creating WebSocket cho camera ${cameraId}:`, error);
//       setStreamStatus("error");
//       setStreamError("Không thể tạo kết nối WebSocket");
//       setImageLoaded(false);
//     }
//   }, [selectedCamera]);

//   useEffect(() => {
//     let isCancelled = false;
//     const handleSwitch = async () => {
//       disconnectWebSocket();
//       if (selectedCamera && !isCancelled) {
//         setTimeout(() => {
//           if (!isCancelled) connectWebSocket();
//         }, 300);
//       }
//     };
//     handleSwitch();
//     return () => {
//       isCancelled = true;
//       disconnectWebSocket();
//     };
//   }, [selectedCamera, connectWebSocket]);

//   const fetchCameras = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("http://127.0.0.1:8000/api/v1/cameras");

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       setCameras(data);
//       setError(null);
//     } catch (err) {
//       console.error("Lỗi khi tải dữ liệu cameras:", err);
//       setError("Không thể kết nối với server. Vui lòng kiểm tra lại backend.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const disconnectWebSocket = () => {
//     return new Promise(resolve => {
//       if (wsRef.current) {
//         console.log("Đang ngắt kết nối WebSocket...");

//         wsRef.current.onclose = () => {
//           console.log("WebSocket thực sự đã đóng.");
//           resolve(); // Đợi đến khi đóng hoàn toàn
//         };

//         wsRef.current.close(1000, "Camera changed");
//         wsRef.current = null;
//       } else {
//         resolve();
//       }

//       setStreamStatus("disconnected");
//       setStreamError(null);
//       setImageLoaded(false);
      
//       // Reset img src khi disconnect
//       if (imgRef.current) {
//         imgRef.current.src = "";
//       }
//     });
//   };

//   const handleMjpegFrame = blob => {
//     if (!imgRef.current) return;

//     try {
//       const jpegBlob = new Blob([blob], { type: "image/jpeg" });
//       const url = URL.createObjectURL(jpegBlob);

//       // Set onload để track khi ảnh đã load xong
//       imgRef.current.onload = () => {
//         setImageLoaded(true);
//         URL.revokeObjectURL(url);
//       };
      
//       // Set onerror để handle trường hợp lỗi
//       imgRef.current.onerror = () => {
//         setImageLoaded(false);
//         URL.revokeObjectURL(url);
//       };

//       imgRef.current.src = url;
//     } catch (error) {
//       console.error("Error handling MJPEG frame:", error);
//       setImageLoaded(false);
//     }
//   };

//   const handleCameraSelect = camera => {
//     console.log(
//       `Chuyển từ camera ${selectedCamera?.camera_id} sang camera ${camera.camera_id}`
//     );

//     // Ngắt kết nối camera cũ trước khi chọn camera mới
//     if (selectedCamera && selectedCamera.camera_id !== camera.camera_id) {
//       disconnectWebSocket();
//     }

//     setSelectedCamera(camera);
//   };

//   const getStreamStatusText = () => {
//     switch (streamStatus) {
//       case "connecting":
//         return "Đang kết nối...";
//       case "connected":
//         return imageLoaded ? "Đã kết nối" : "Đang tải stream...";
//       case "error":
//         return "Lỗi kết nối";
//       default:
//         return "Chưa kết nối";
//     }
//   };

//   const getStreamStatusColor = () => {
//     switch (streamStatus) {
//       case "connecting":
//         return "text-yellow-600";
//       case "connected":
//         return imageLoaded ? "text-green-600" : "text-yellow-600";
//       case "error":
//         return "text-red-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         <span className="ml-2">Đang tải...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <h3 className="font-bold mb-2 text-red-600">Lỗi kết nối</h3>
//           <p className="text-red-500 mb-4">{error}</p>
//           <button
//             onClick={fetchCameras}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Thử lại
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex">
//       {/* Nửa màn hình bên trái - Danh sách camera và stream */}
//       <div className="w-1/2 flex flex-col">
//         {/* Danh sách camera ở góc trên bên trái */}
//         <div className="p-4 border-b border-gray-200">
//           <h3 className="font-bold text-lg mb-3">Danh sách Camera</h3>
//           <div className="space-y-2 max-h-32 overflow-y-auto">
//             {cameras.length === 0 ? (
//               <p className="text-gray-500">Không có camera nào</p>
//             ) : (
//               cameras.map((camera, index) => (
//                 <div
//                   key={index}
//                   onClick={() => handleCameraSelect(camera)}
//                   className={`p-2 rounded cursor-pointer transition-colors ${
//                     selectedCamera?.camera_id === camera.camera_id
//                       ? "bg-blue-100 border-l-4 border-blue-500"
//                       : "bg-gray-50 hover:bg-gray-100"
//                   }`}
//                 >
//                   <span className="font-medium">
//                     Camera {camera.camera_id || camera.name || index + 1}
//                   </span>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Stream video bên dưới */}
//         <div className="flex-1 p-4">
//           {selectedCamera ? (
//             <div className="h-full">
//               <div className="flex items-center justify-between mb-3">
//                 <h4 className="font-semibold">
//                   Stream: Camera{" "}
//                   {selectedCamera.camera_id || selectedCamera.name}
//                 </h4>
//                 <div className="flex items-center space-x-2">
//                   <div
//                     className={`w-2 h-2 rounded-full ${
//                       streamStatus === "connected" && imageLoaded
//                         ? "bg-green-500"
//                         : streamStatus === "connecting" || (streamStatus === "connected" && !imageLoaded)
//                           ? "bg-yellow-500"
//                           : streamStatus === "error"
//                             ? "bg-red-500"
//                             : "bg-gray-500"
//                     }`}
//                   ></div>
//                   <span className={`text-sm ${getStreamStatusColor()}`}>
//                     {getStreamStatusText()}
//                   </span>
//                 </div>
//               </div>

//               <div className="bg-black rounded-lg h-full flex items-center justify-center overflow-hidden relative">
//                 {/* Loading overlay khi đang kết nối hoặc chưa load xong ảnh */}
//                 {(streamStatus === "connecting" || (streamStatus === "connected" && !imageLoaded)) && (
//                   <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
//                     <div className="text-white text-center">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
//                       <p>{streamStatus === "connecting" ? "Đang kết nối stream..." : "Đang tải stream..."}</p>
//                     </div>
//                   </div>
//                 )}

//                 {streamStatus === "connected" ? (
//                   <img
//                     ref={imgRef}
//                     width="640"
//                     height="480"
//                     className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
//                       imageLoaded ? "opacity-100" : "opacity-0"
//                     }`}
//                     alt="Camera Stream"
//                   />
//                 ) : streamStatus === "error" ? (
//                   <div className="text-white text-center">
//                     <p className="text-red-400 mb-2">Lỗi kết nối stream</p>
//                     <p className="text-sm text-gray-400 mb-3">{streamError}</p>
//                     <button
//                       onClick={connectWebSocket}
//                       className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                     >
//                       Thử kết nối lại
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="text-white text-center">
//                     <p>Chưa kết nối stream</p>
//                     <p className="text-sm text-gray-400 mt-2">
//                       ws://127.0.0.1:8000/api/v1/ws/stream/
//                       {selectedCamera.camera_id}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ) : (
//             <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
//               <p className="text-gray-500">Chọn camera để xem stream</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Nửa màn hình bên phải - Hello */}
//       <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
//         <div className="text-center">
//           <h1 className="text-6xl font-bold text-blue-600 mb-4">Hello</h1>
//           <p className="text-xl text-gray-600">cho tôi</p>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useRef, useCallback } from "react";

export default function CameraStream() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [streamStatus, setStreamStatus] = useState("disconnected"); // disconnected, connecting, connected, error
  const [streamError, setStreamError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false); // Thêm state để track việc load ảnh

  const wsRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    fetchCameras();
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
      {/* Nửa màn hình bên trái - Danh sách camera và stream */}
      <div className="w-1/2 flex flex-col">
        {/* Danh sách camera ở góc trên bên trái */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg mb-3">Danh sách Camera</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {cameras.length === 0 ? (
              <p className="text-gray-500">Không có camera nào</p>
            ) : (
              cameras.map((camera, index) => (
                <div
                  key={index}
                  onClick={() => handleCameraSelect(camera)}
                  className={`p-2 rounded cursor-pointer transition-colors ${
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

        {/* Stream video bên dưới */}
        <div className="flex-1 p-4">
          {selectedCamera ? (
            <div className="h-full">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">
                  Stream: Camera{" "}
                  {selectedCamera.camera_id || selectedCamera.name}
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

              <div className="bg-black rounded-lg h-full flex items-center justify-center overflow-hidden relative">
                {/* Loading overlay khi đang kết nối hoặc chưa load xong ảnh */}
                {(streamStatus === "connecting" || (streamStatus === "connected" && !imageLoaded)) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p>{streamStatus === "connecting" ? "Đang kết nối stream..." : "Đang tải stream..."}</p>
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
                    <p className="text-red-400 mb-2">Lỗi kết nối stream</p>
                    <p className="text-sm text-gray-400 mb-3">{streamError}</p>
                    <button
                      onClick={connectWebSocket}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Thử kết nối lại
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">Chọn camera để xem stream</p>
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
    </div>
  );
}