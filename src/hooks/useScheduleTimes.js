import { useState, useEffect } from "react";
import { apiService } from "../services/api";

export const useScheduleTimes = () => {
  const [scheduleTimes, setScheduleTimes] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const fetchScheduleTimes = async () => {
    try {
      setScheduleLoading(true);
      const data = await apiService.getScheduleTimes();
      setScheduleTimes(data);
    } catch (err) {
      console.error("Lỗi khi tải schedule times:", err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const updateScheduleTime = async (scheduleTimeId, isActive) => {
    try {
      await apiService.updateScheduleTime(scheduleTimeId, { is_active: isActive });

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