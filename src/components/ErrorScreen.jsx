export default function ErrorScreen({ error, onRetry }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h3 className="font-bold mb-2 text-red-600">Lỗi kết nối</h3>
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
} 