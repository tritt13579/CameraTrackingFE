import { useState, useEffect } from "react";

export const useScheduleTimes = () => {
  const [scheduleTimes, setScheduleTimes] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

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

  useEffect(() => {
    fetchScheduleTimes();
  }, []);

  return {
    scheduleTimes,
    scheduleLoading,
    fetchScheduleTimes,
    updateScheduleTime,
    formatTime
  };
}; 