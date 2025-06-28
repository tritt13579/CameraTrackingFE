const API_BASE_URL = '/api/v1';

export const apiService = {
  // Lấy dữ liệu biểu đồ độ lún
  async getSettlementChart(params) {
    const queryParams = new URLSearchParams(params);
    const url = `${API_BASE_URL}/settlement-chart?${queryParams}`;
    
    console.log("🌐 Gọi API URL:", url);
    console.log("📋 Query params:", Object.fromEntries(queryParams));
    
    const response = await fetch(url);
    
    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("📦 API Response data:", data);
    
    return data;
  },

  // Lấy danh sách camera
  async getCameras() {
    const response = await fetch(`${API_BASE_URL}/cameras`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Thêm camera mới
  async addCamera(cameraData) {
    const response = await fetch(`${API_BASE_URL}/cameras`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cameraData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Lấy lịch chụp
  async getScheduleTimes() {
    const response = await fetch(`${API_BASE_URL}/schedule-times`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  // Cập nhật lịch chụp
  async updateScheduleTime(scheduleId, timeData) {
    const response = await fetch(`${API_BASE_URL}/schedule-times/${scheduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(timeData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
}; 