import { useState, useEffect, useRef, useCallback } from "react";

export const useWebSocket = (selectedCamera) => {
  const [streamStatus, setStreamStatus] = useState("disconnected");
  const [streamError, setStreamError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const wsRef = useRef(null);
  const imgRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    if (!selectedCamera) return;

    disconnectWebSocket();

    setStreamStatus("connecting");
    setStreamError(null);
    setImageLoaded(false);
    
    if (imgRef.current) {
      imgRef.current.src = "";
    }

    const cameraId = selectedCamera.camera_id || 1;
    const wsUrl = `ws://127.0.0.1:8000/api/v1/ws/stream/${cameraId}`;

    console.log(`Đang kết nối WebSocket cho camera ${cameraId}: ${wsUrl}`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.binaryType = "blob";

      ws.onopen = () => {
        console.log(`WebSocket connected cho camera ${cameraId}`);
        setStreamStatus("connected");
      };

      ws.onmessage = event => {
        if (event.data instanceof Blob) {
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

  const disconnectWebSocket = useCallback(() => {
    return new Promise(resolve => {
      if (wsRef.current) {
        console.log("Đang ngắt kết nối WebSocket...");

        wsRef.current.onclose = () => {
          console.log("WebSocket thực sự đã đóng.");
          resolve();
        };

        wsRef.current.close(1000, "Camera changed");
        wsRef.current = null;
      } else {
        resolve();
      }

      setStreamError(null);
      setImageLoaded(false);
      
      if (imgRef.current) {
        imgRef.current.src = "";
      }
    });
  }, []);

  const handleMjpegFrame = useCallback((blob) => {
    if (!imgRef.current) return;

    try {
      const jpegBlob = new Blob([blob], { type: "image/jpeg" });
      const url = URL.createObjectURL(jpegBlob);

      imgRef.current.onload = () => {
        setImageLoaded(true);
        URL.revokeObjectURL(url);
      };
      
      imgRef.current.onerror = () => {
        setImageLoaded(false);
        URL.revokeObjectURL(url);
      };

      imgRef.current.src = url;
    } catch (error) {
      console.error("Error handling MJPEG frame:", error);
      setImageLoaded(false);
    }
  }, []);

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
  }, [selectedCamera, connectWebSocket, disconnectWebSocket]);

  return {
    streamStatus,
    streamError,
    imageLoaded,
    imgRef,
    connectWebSocket,
    disconnectWebSocket
  };
}; 