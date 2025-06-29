export default function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
      <button
        onClick={() => setActiveTab("cameras")}
        className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
          activeTab === "cameras"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
        }`}
      >
        <span className="hidden sm:inline">Danh sách Camera</span>
        <span className="sm:hidden">Camera</span>
      </button>
      <button
        onClick={() => setActiveTab("schedule")}
        className={`px-3 py-2 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
          activeTab === "schedule"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
        }`}
      >
        <span className="hidden sm:inline">Khung giờ chụp</span>
        <span className="sm:hidden">Lịch</span>
      </button>
    </div>
  );
} 