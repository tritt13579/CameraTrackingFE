export default function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div className="flex space-x-2 mb-4">
      <button
        onClick={() => setActiveTab("cameras")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          activeTab === "cameras"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Danh sách Camera
      </button>
      <button
        onClick={() => setActiveTab("schedule")}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          activeTab === "schedule"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Khung giờ chụp
      </button>
    </div>
  );
} 