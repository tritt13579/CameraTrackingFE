export default function ChartInfo() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* QR Động */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-700">QR Động</p>
              <p className="text-xs text-gray-500">Camera 1, QR 1</p>
            </div>
          </div>

          {/* QR Cố định */}
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-gray-700">QR Cố định</p>
              <p className="text-xs text-gray-500">Camera 2, QR 2</p>
            </div>
          </div>

          {/* Công thức */}
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-700">Công thức</p>
              <p className="text-xs text-gray-500">Độ lún = (ym - ym0) × Sb - (yr - yr0) × Sa</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 font-medium">Đang cập nhật</span>
        </div>
      </div>
    </div>
  );
} 