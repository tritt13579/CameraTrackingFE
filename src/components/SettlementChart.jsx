import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { vi } from "date-fns/locale";
import { apiService } from "../services/api";
import ChartInfo from "./ChartInfo";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function SettlementChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interval, setInterval] = useState("hour"); // hour, day, month, year
  const [dateRange, setDateRange] = useState({
    from: format(startOfDay(subDays(new Date(), 7)), "yyyy-MM-dd"),
    to: format(endOfDay(new Date()), "yyyy-MM-dd")
  });

  // Tính toán thời gian bắt đầu và kết thúc
  const getTimeRange = () => {
    const from = new Date(dateRange.from + "T00:00:00");
    const to = new Date(dateRange.to + "T23:59:59");

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  };

  // Xử lý thay đổi ngày
  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch dữ liệu từ API
  const fetchChartData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { from, to } = getTimeRange();
      
      // Mặc định: QR 1 của camera 1 là QR động, QR 2 của camera 2 là QR cố định
      const params = {
        qr_code_id_movable: 1,
        qr_code_id_fixed: 2,
        camera_id_movable: 1,
        camera_id_fixed: 2,
        interval: interval,
        time_from: from,
        time_to: to,
      };

      console.log("🚀 Gọi API Settlement Chart với params:", params);
      console.log("📅 Khoảng thời gian:", { from, to });
      console.log("⏰ Interval:", interval);

      const data = await apiService.getSettlementChart(params);
      
      console.log("✅ Dữ liệu API trả về:", data);
      console.log("📊 Số lượng điểm dữ liệu:", data.length);
      
      if (data.length > 0) {
        console.log("📈 Điểm dữ liệu đầu tiên:", data[0]);
        console.log("📉 Điểm dữ liệu cuối cùng:", data[data.length - 1]);
        console.log("🔢 Giá trị độ lún:", data.map(item => item.settlement));
      }
      
      // Chuyển đổi dữ liệu cho Chart.js
      const chartData = {
        labels: data.map(item => {
          const date = new Date(item.time);
          switch (interval) {
            case "hour":
              return format(date, "HH:mm", { locale: vi });
            case "day":
              return format(date, "dd/MM", { locale: vi });
            case "month":
              return format(date, "MM/yyyy", { locale: vi });
            case "year":
              return format(date, "yyyy", { locale: vi });
            default:
              return format(date, "HH:mm", { locale: vi });
          }
        }),
        datasets: [
          {
            label: "Độ lún (mm)",
            data: data.map(item => item.settlement),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };

      console.log("🎨 Dữ liệu Chart.js:", chartData);
      setChartData(chartData);
    } catch (err) {
      console.error("❌ Lỗi khi tải dữ liệu biểu đồ:", err);
      console.error("🔍 Chi tiết lỗi:", err.message);
      setError("Không thể tải dữ liệu biểu đồ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Tự động fetch dữ liệu khi component mount hoặc khi thay đổi tham số
  useEffect(() => {
    fetchChartData();
  }, [interval, dateRange]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#374151",
        },
      },
      title: {
        display: true,
        text: "Biểu đồ độ lún theo thời gian",
        font: {
          size: 18,
          weight: "bold",
        },
        color: "#1f2937",
        padding: 20,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(59, 130, 246, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Độ lún: ${context.parsed.y.toFixed(2)} mm`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: "Thời gian",
          color: "#374151",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#6b7280",
          font: {
            size: 12,
          },
          callback: function(value) {
            return value.toFixed(2) + " mm";
          },
        },
        title: {
          display: true,
          text: "Độ lún (mm)",
          color: "#374151",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  const intervalOptions = [
    { value: "hour", label: "Theo giờ" },
    { value: "day", label: "Theo ngày" },
    { value: "month", label: "Theo tháng" },
    { value: "year", label: "Theo năm" },
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Chart Info */}
      <ChartInfo />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Biểu đồ độ lún</h2>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi độ lún theo thời gian thực
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Date Range Picker - UI giống booking website */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm">
            <div className="flex items-center px-3 py-2 border-r border-gray-300">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <label className="text-xs text-gray-500 block">Từ ngày</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => handleDateChange("from", e.target.value)}
                  className="text-sm font-medium text-gray-900 border-none outline-none bg-transparent"
                />
              </div>
            </div>
            <div className="flex items-center px-3 py-2">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <label className="text-xs text-gray-500 block">Đến ngày</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => handleDateChange("to", e.target.value)}
                  className="text-sm font-medium text-gray-900 border-none outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Interval Selector */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Nhóm theo:</label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {intervalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchChartData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang tải...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm mới
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0">
        {loading && !chartData ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu biểu đồ...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2">Lỗi tải dữ liệu</p>
              <p className="text-gray-600 text-sm mb-4">{error}</p>
              <button
                onClick={fetchChartData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : chartData ? (
          <div className="h-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-600">Không có dữ liệu để hiển thị</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 