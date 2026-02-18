"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import ChartTab from "../common/ChartTab";
import { CalenderIcon } from "../../icons";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StatisticsChart() {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [filter, setFilter] = useState<"monthly" | "quarterly" | "annually">("monthly");
  const [dateRange, setDateRange] = useState<Date[]>([]);
  const [series, setSeries] = useState([
    { name: "Active", data: [] as number[] },
    { name: "Processing", data: [] as number[] },
    { name: "Pending", data: [] as number[] },
    { name: "Cancelled", data: [] as number[] },
  ]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!datePickerRef.current) return;

    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M d, Y",
      prevArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M5.4 10.8l1.4-1.4-4-4 4-4L5.4 0 0 5.4z" /></svg>',
      nextArrow: '<svg class="fill-current" width="7" height="11" viewBox="0 0 7 11"><path d="M1.4 10.8L0 9.4l4-4-4-4L1.4 0l5.4 5.4z" /></svg>',
      onChange: (selectedDates) => {
        if (selectedDates.length === 2) {
          setDateRange(selectedDates);
          // When custom date is picked, we might want to switch filter to 'custom' implies logic
          // But for now let's just use the range to filter data if present
        }
      }
    });

    return () => {
      fp.destroy();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/dashboard');
        if (!res.ok) return;
        const data = await res.json();
        const orders = data.chartOrders || [];

        processData(orders, filter, dateRange);
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      }
    };
    fetchData();
  }, [filter, dateRange]);

  const processData = (orders: any[], currentFilter: string, range: Date[]) => {
    // Basic aggregation logic
    // Helper to get key (Month, Quarter, Year, or Day)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    let groupedData: Record<string, { active: number; processing: number; pending: number; cancelled: number }> = {};
    let cats: string[] = [];

    // Filter by date range if Custom Range is selected (implies range.length === 2)
    let filteredOrders = orders;
    if (range.length === 2) {
      const start = range[0].getTime();
      const end = range[1].getTime() + 86400000; // Include end date
      filteredOrders = orders.filter((o: any) => {
        const t = new Date(o.createdAt).getTime();
        return t >= start && t < end;
      });
    }

    filteredOrders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      let key = "";

      if (range.length === 2) {
        // If custom range, group by Day
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (currentFilter === 'monthly') {
        key = monthNames[date.getMonth()];
      } else if (currentFilter === 'quarterly') {
        const q = Math.floor(date.getMonth() / 3) + 1;
        key = `Q${q}`;
      } else if (currentFilter === 'annually') {
        key = date.getFullYear().toString();
      }

      if (!groupedData[key]) groupedData[key] = { active: 0, processing: 0, pending: 0, cancelled: 0 };

      const status = order.status.toLowerCase();
      if (status === 'active' || status === 'ready') groupedData[key].active++;
      else if (status === 'processing') groupedData[key].processing++;
      else if (status === 'pending') groupedData[key].pending++;
      else if (status === 'inactive' || status === 'cancelled') groupedData[key].cancelled++;
    });

    // Sort categories
    if (currentFilter === 'monthly') {
      cats = monthNames;
    } else if (currentFilter === 'quarterly') {
      cats = ["Q1", "Q2", "Q3", "Q4"];
    } else if (range.length === 2) {
      cats = Object.keys(groupedData); // This might be unordered.
    } else {
      cats = Object.keys(groupedData).sort();
    }

    // Map to series
    const activeData = cats.map(c => groupedData[c]?.active || 0);
    const processingData = cats.map(c => groupedData[c]?.processing || 0);
    const pendingData = cats.map(c => groupedData[c]?.pending || 0);
    const cancelledData = cats.map(c => groupedData[c]?.cancelled || 0);

    setCategories(cats);
    setSeries([
      { name: "Active", data: activeData },
      { name: "Processing", data: processingData },
      { name: "Pending", data: pendingData },
      { name: "Cancelled", data: cancelledData }
    ]);
  };

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"], // Green, Blue, Yellow, Red
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2, 2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: { text: "" },
    },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistics
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Orders by Status
          </p>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <ChartTab selected={filter} onChange={setFilter} />
          <div className="relative inline-flex items-center">
            <CalenderIcon className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:left-3 lg:top-1/2 lg:translate-x-0 lg:-translate-y-1/2  text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-10 w-10 lg:w-40 lg:h-auto  lg:pl-10 lg:pr-3 lg:py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-transparent lg:text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:lg:text-gray-300 cursor-pointer"
              placeholder="Select date range"
            />
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}