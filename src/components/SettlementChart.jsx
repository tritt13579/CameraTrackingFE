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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { apiService } from "../services/api";

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
  const [dateRange, setDateRange] = useState([
    startOfDay(subDays(new Date(), 7)),
    endOfDay(new Date())
  ]);
  const [startDate, endDate] = dateRange;
  const [isDateRangeComplete, setIsDateRangeComplete] = useState(true); // Thêm state để theo dõi việc chọn date range

  // Tính toán thời gian bắt đầu và kết thúc
  const getTimeRange = () => {
    const from = startDate;
    const to = endDate;

    return {
      from: from.toISOString(),
      to: to.toISOString(),
    };
  };

  // Xử lý thay đổi date range
  const handleDateRangeChange = (update) => {
    setDateRange(update);
    const [newStartDate, newEndDate] = update;
    
    // Kiểm tra xem cả hai ngày đã được chọn chưa
    const isComplete = newStartDate && newEndDate;
    setIsDateRangeComplete(isComplete);
    
    // Không xóa dữ liệu biểu đồ khi đang chọn ngày
    // Chỉ cập nhật khi đã chọn xong
  };

  // Fetch dữ liệu từ API
  const fetchChartData = async () => {
    // Chỉ fetch khi date range đã hoàn chỉnh
    if (!isDateRangeComplete) {
      console.log("⏳ Chưa chọn đủ ngày bắt đầu và kết thúc");
      return;
    }

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
    // Chỉ fetch khi date range đã hoàn chỉnh
    if (isDateRangeComplete) {
      fetchChartData();
    }
  }, [interval, dateRange, isDateRangeComplete]);

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
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-6">
      {/* Header với gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-6 mb-3 sm:mb-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Biểu đồ độ lún</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Theo dõi độ lún theo thời gian thực
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between flex-wrap gap-3 sm:gap-4">
          {/* Date Range Picker */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-2 w-full sm:w-auto">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
                className="text-sm font-medium text-gray-900 border-none outline-none bg-transparent cursor-pointer w-full sm:w-auto"
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn khoảng thời gian"
                locale={vi}
                showPopperArrow={false}
                popperClassName="datepicker-popper"
                popperPlacement="bottom-start"
                customInput={
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 w-full">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs sm:text-sm text-gray-600">Từ:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Chọn ngày"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs sm:text-sm text-gray-600">Đến:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Chọn ngày"}
                      </span>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Interval Selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Nhóm theo:</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm bg-white shadow-sm w-full sm:w-auto"
              >
                {intervalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 min-h-0 bg-gray-50 rounded-xl p-3 sm:p-6">
        {loading && !chartData ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600 mx-auto mb-4 sm:mb-6"></div>
              <p className="text-gray-600 text-sm sm:text-lg font-medium">Đang tải dữ liệu biểu đồ...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium text-sm sm:text-lg mb-2 sm:mb-3">Lỗi tải dữ liệu</p>
              <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">{error}</p>
              <button
                onClick={fetchChartData}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium shadow-lg"
              >
                Thử lại
              </button>
            </div>
          </div>
        ) : chartData ? (
          <div className="h-full bg-white rounded-lg p-2 sm:p-4 shadow-sm relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-4 border-blue-600 mx-auto mb-2 sm:mb-4"></div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Đang cập nhật dữ liệu...</p>
                </div>
              </div>
            )}
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm sm:text-lg font-medium">Không có dữ liệu để hiển thị</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 