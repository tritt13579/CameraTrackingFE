export default function ScheduleTab({ 
  scheduleTimes, 
  scheduleLoading, 
  onUpdateScheduleTime, 
  formatTime 
}) {
  return (
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
                  onChange={(e) => onUpdateScheduleTime(schedule.schedule_time_id, e.target.checked)}
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
  );
} 