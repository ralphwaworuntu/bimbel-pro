"use client";
import React, { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, CartIcon, GroupIcon } from "@/icons";

export const EcommerceMetrics = () => {
  const [stats, setStats] = useState({
    activeTenants: 0,
    totalOrders: 0,
    ordersThisMonth: 0,
    ordersLastMonth: 0,
    activeOrdersThisMonth: 0,
    activeOrdersLastMonth: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };
    fetchStats();
  }, []);

  // Calculate Growth
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const customersGrowth = calculateGrowth(stats.activeOrdersThisMonth, stats.activeOrdersLastMonth);
  const ordersGrowth = calculateGrowth(stats.ordersThisMonth, stats.ordersLastMonth);

  const formatPercentage = (val: number) => `${Math.abs(val).toFixed(2)}%`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* <!-- Customers Card --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers (Active Sites)
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats.activeTenants}
            </h4>
          </div>
          <Badge color={customersGrowth >= 0 ? "success" : "error"}>
            {customersGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {formatPercentage(customersGrowth)}
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Orders Card --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <CartIcon className="text-gray-800 dark:text-white/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stats.totalOrders}
            </h4>
          </div>

          <Badge color={ordersGrowth >= 0 ? "success" : "error"}>
            {ordersGrowth >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {formatPercentage(ordersGrowth)}
          </Badge>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  );
};
