export default function ScheduleTab({ 
  scheduleTimes, 
  scheduleLoading, 
  onUpdateScheduleTime, 
  formatTime 
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
        <h3 className="font-bold text-base sm:text-lg text-gray-800">Khung giờ chụp</h3>
        {scheduleLoading && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-xs sm:text-sm text-gray-600">Đang cập nhật...</span>
          </div>
        )}
      </div>
      
      <div className="flex-1 space-y-1.5 sm:space-y-2 overflow-y-auto">
        {scheduleTimes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-sm text-center">Không có khung giờ nào</p>
          </div>
        ) : (
          scheduleTimes.map((schedule) => (
            <div
              key={schedule.schedule_time_id}
              className="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm sm:text-base font-medium text-gray-700">
                {formatTime(schedule.capture_time)}
              </span>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={schedule.is_active}
                  onChange={(e) => onUpdateScheduleTime(schedule.schedule_time_id, e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  schedule.is_active ? 'bg-blue-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
                    schedule.is_active ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </label>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 