import { useState, useEffect, useCallback } from "react";
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
import { format, startOfDay, endOfDay, addDays } from "date-fns";
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
    startOfDay(new Date()),
    endOfDay(addDays(new Date(), 1))
  ]);
  const [startDate, endDate] = dateRange;
  const [isDateRangeComplete, setIsDateRangeComplete] = useState(true); 

  // Handle date range change
  const handleDateRangeChange = (update) => {
    setDateRange(update);
    const [newStartDate, newEndDate] = update;
    
    const isComplete = newStartDate && newEndDate;
    setIsDateRangeComplete(isComplete);
  };

  // Create API parameters
  const createApiParams = useCallback(() => {
    const timeRange = {
      from: startDate.toISOString(),
      to: endDate.toISOString(),
    };
    
    return {
      qr_code_id_movable: 1,
      qr_code_id_fixed: 2,
      camera_id_movable: 1,
      camera_id_fixed: 2,
      interval: interval,
      time_from: timeRange.from,
      time_to: timeRange.to,
    };
  }, [interval, startDate, endDate]);

  // Fetch data from API
  const fetchChartData = useCallback(async () => {
    // Only fetch when date range is complete
    if (!isDateRangeComplete) {
      console.log("⏳ Please select both start and end dates");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = createApiParams();
      const data = await apiService.getSettlementChart(params);
      

      // Convert data for Chart.js
      const chartData = {
        labels: data.map(item => {
          const date = new Date(item.time);
          switch (interval) {
            case "hour":
              return format(date, "HH:mm");
            case "day":
              return format(date, "MM/dd");
            case "month":
              return format(date, "MM/yyyy");
            case "year":
              return format(date, "yyyy");
            default:
              return format(date, "HH:mm");
          }
        }),
        datasets: [
          {
            label: "Settlement (mm)",
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

      setChartData(chartData);
    } catch (err) {
      console.error("❌ Error loading chart data:", err);
      console.error("🔍 Error details:", err.message);
      setError("Unable to load chart data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [interval, isDateRangeComplete, createApiParams]);

  // Download CSV function
  const handleDownloadExcel = async () => {
    if (!isDateRangeComplete) {
      alert("Please select complete date range before downloading data.");
      return;
    }

    try {
      const params = createApiParams();
      const data = await apiService.getSettlementChart(params);
      
      // Create CSV content
      const headers = ["Time", "Settlement (mm)"];
      const csvContent = [
        headers.join(","),
        ...data.map(item => {
          const date = new Date(item.time);
          const timeStr = format(date, "MM/dd/yyyy HH:mm:ss");
          return `${timeStr},${item.settlement}`;
        })
      ].join("\n");

      // Create file and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");
      const intervalStr = intervalOptions.find(opt => opt.value === interval)?.value || interval;
      
      link.setAttribute("href", url);
      link.setAttribute("download", `settlement_data_${startDateStr}_to_${endDateStr}_${intervalStr}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("❌ Error downloading CSV file:", err);
      alert("Unable to download data. Please try again.");
    }
  };

  // Auto fetch data when component mounts or parameters change
  useEffect(() => {
    // Only fetch when date range is complete
    if (isDateRangeComplete) {
      fetchChartData();
    }
  }, [interval, dateRange, isDateRangeComplete, fetchChartData]);

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
        text: "Settlement Chart Over Time",
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
            return `Settlement: ${context.parsed.y.toFixed(2)} mm`;
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
          text: "Time",
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
          text: "Settlement (mm)",
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
    { value: "hour", label: "By Hour" },
    { value: "day", label: "By Day" },
    { value: "month", label: "By Month" },
    { value: "year", label: "By Year" },
  ];

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-6">
      {/* Header với gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-6 mb-3 sm:mb-6 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Settlement Chart</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Monitor settlement in real-time
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
                dateFormat="MM/dd/yyyy"
                placeholderText="Select date range"
                locale={vi}
                showPopperArrow={false}
                popperClassName="datepicker-popper"
                popperPlacement="bottom-start"
                customInput={
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 w-full">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs sm:text-sm text-gray-600">From:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {startDate ? format(startDate, "MM/dd/yyyy") : "Select date"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs sm:text-sm text-gray-600">To:</span>
                      <span className="font-medium text-xs sm:text-sm">
                        {endDate ? format(endDate, "MM/dd/yyyy") : "Select date"}
                      </span>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Interval Selector and Download Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <label className="text-xs sm:text-sm font-medium text-gray-700">Group by:</label>
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

              {/* Download Button */}
              <button
                onClick={handleDownloadExcel}
                disabled={!isDateRangeComplete || loading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download</span>
              </button>
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
              <p className="text-gray-600 text-sm sm:text-lg font-medium">Loading chart data...</p>
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
              <p className="text-red-600 font-medium text-sm sm:text-lg mb-2 sm:mb-3">Data Loading Error</p>
              <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm">{error}</p>
              <button
                onClick={fetchChartData}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : chartData ? (
          <div className="h-full bg-white rounded-lg p-2 sm:p-4 shadow-sm relative">
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-4 border-blue-600 mx-auto mb-2 sm:mb-4"></div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">Updating data...</p>
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
              <p className="text-gray-600 text-sm sm:text-lg font-medium">No data to display</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 