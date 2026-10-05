import React, { useState } from 'react';
import { ExecutiveOverview, Region, Order, UserProfile, ViewType } from '../../types';

interface DashboardViewProps {
  overview: ExecutiveOverview;
  currentUser?: UserProfile;
  onNavigateToOrders?: (filterRegion?: Region) => void;
  onNavigateToInventory?: () => void;
  onNavigateToCustomers?: () => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToLogistics?: (waybill?: string) => void;
  onSelectOrder?: (order: Order) => void;
  onTrack3PL?: (waybillNo: string) => void;
  onExportPdf?: () => void;
  onExportCsv?: () => void;
  onNavigate?: (view: ViewType) => void;
  onExportReport?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  overview,
  currentUser,
  onNavigateToOrders,
  onNavigateToInventory,
  onNavigateToCustomers,
  onNavigateToAnalytics,
  onNavigateToLogistics,
  onSelectOrder,
  onTrack3PL,
  onExportPdf,
  onExportCsv,
  onNavigate,
  onExportReport,
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('North America');
  const [dateFilter, setDateFilter] = useState<'This Month' | 'Last 30 Days' | 'This Quarter' | 'Year to Date'>('This Month');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const goToOrders = (reg?: Region) => {
    if (onNavigateToOrders) onNavigateToOrders(reg);
    else if (onNavigate) onNavigate('orders');
  };

  const goToInventory = () => {
    if (onNavigateToInventory) onNavigateToInventory();
    else if (onNavigate) onNavigate('inventory');
  };

  const goToCustomers = () => {
    if (onNavigateToCustomers) onNavigateToCustomers();
    else if (onNavigate) onNavigate('customers');
  };

  const goToAnalytics = () => {
    if (onNavigateToAnalytics) onNavigateToAnalytics();
    else if (onNavigate) onNavigate('analytics');
  };

  const goToLogistics = (wb?: string) => {
    if (onTrack3PL && wb) onTrack3PL(wb);
    else if (onNavigateToLogistics) onNavigateToLogistics(wb);
    else if (onNavigate) onNavigate('logistics');
  };

  const handleExportPdf = () => {
    if (onExportPdf) onExportPdf();
    else if (onExportReport) onExportReport();
  };

  const handleExportCsv = () => {
    if (onExportCsv) onExportCsv();
    else if (onExportReport) onExportReport();
  };

  // SVG Spline coordinates calculation
  const trendData = overview.revenueTrends;
  const maxRev = 3.0; // 3M max height
  const chartHeight = 180;
  const chartWidth = 600;

  const points = trendData.map((d, index) => {
    const x = (index / (trendData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (d.revenue / maxRev) * (chartHeight - 30) - 15;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + curr.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div id="dashboard-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[26px] md:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
              Executive Overview
            </h2>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/30">
              Live Feed
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time sales velocity, multi-facility inventory health, and 3PL telematics.
          </p>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-3 relative">
          <div className="relative">
            <select
              id="dashboard-date-filter"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="appearance-none px-3.5 py-2 pr-8 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#242933] transition-colors cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              <option>This Month</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>

          <div className="relative">
            <button
              id="btn-dashboard-export"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[17px]">download</span>
              Export Report
              <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl shadow-2xl z-40 p-1.5 text-[12px]">
                  <button
                    onClick={() => {
                      handleExportPdf();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C222D] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[17px] text-rose-500">picture_as_pdf</span>
                    Export PDF Report
                  </button>
                  <button
                    onClick={() => {
                      handleExportCsv();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C222D] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[17px] text-emerald-500">table_chart</span>
                    Export CSV Data
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Revenue */}
        <div
          id="kpi-revenue"
          onClick={() => goToAnalytics()}
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">TOTAL REVENUE</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-[18px]">attach_money</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              ${(overview.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+{overview.revenueGrowthPct}%</span>
              <span className="text-gray-400 font-normal text-[11px] ml-1">vs prev. month</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div
          id="kpi-orders"
          onClick={() => goToOrders()}
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">TOTAL ORDERS</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              {overview.totalOrders.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+{overview.ordersGrowthPct}%</span>
              <span className="text-gray-400 font-normal text-[11px] ml-1">vs prev. month</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Active Shipments */}
        <div
          id="kpi-shipments"
          onClick={() => goToLogistics()}
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACTIVE LOGISTICS</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-blue-500 dark:text-blue-400 leading-tight">
              {overview.activeShipments}
            </div>
            <div className="flex items-center gap-1 text-[12px] font-medium text-gray-500 dark:text-gray-400 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>3PL Live Feeds Connected</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Customer Satisfaction */}
        <div
          id="kpi-csat"
          onClick={() => goToInventory()}
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">INVENTORY HEALTH</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              94.2%
            </div>
            <div className="flex items-center gap-1 text-[12px] font-medium text-gray-500 dark:text-gray-400 mt-2">
              <span>1,240 Units in Stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Map Grid (2 Columns + 1 Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trends (12 Months) Chart */}
        <div
          id="chart-revenue-trends"
          className="lg:col-span-2 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-6 shadow-sm flex flex-col min-h-[380px]"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                Real-time Sales Velocity
              </h3>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                12-month rolling trajectory across global distribution centers
              </p>
            </div>
            <button
              onClick={goToAnalytics}
              className="text-[12px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              Deep Analytics
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          {/* Chart Canvas Area */}
          <div className="flex-1 relative w-full bg-gray-50 dark:bg-[#1C222D] rounded-lg border border-gray-200 dark:border-[#242933] p-4 flex flex-col justify-between overflow-hidden">
            <div className="relative flex-1 w-full h-[220px]">
              {/* Y Axis Guides */}
              <div className="absolute left-2 top-0 bottom-6 flex flex-col justify-between text-[11px] font-data-mono text-gray-400 dark:text-gray-500 pointer-events-none z-0">
                <span>3M</span>
                <span>2M</span>
                <span>1M</span>
                <span>0</span>
              </div>

              {/* Grid Lines */}
              <div className="absolute inset-0 left-10 flex flex-col justify-between py-2 pointer-events-none">
                <div className="w-full border-t border-gray-200 dark:border-[#242933] border-dashed" />
                <div className="w-full border-t border-gray-200 dark:border-[#242933] border-dashed" />
                <div className="w-full border-t border-gray-200 dark:border-[#242933] border-dashed" />
                <div className="w-full border-t border-gray-200 dark:border-[#242933]" />
              </div>

              {/* SVG Curve */}
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-full absolute inset-0 overflow-visible z-10"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="emerald-gradient-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Filled Area */}
                <path d={areaD} fill="url(#emerald-gradient-fill)" />

                {/* Smooth Stroke */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((pt, idx) => {
                  const isHovered = selectedMonthIndex === idx;
                  const isHighlighted = idx === 0 || idx === 3 || idx === 6 || idx === 9 || idx === points.length - 1;
                  if (!isHighlighted && !isHovered) return null;

                  return (
                    <g key={pt.month}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 7 : 4.5}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-200"
                        onMouseEnter={() => setSelectedMonthIndex(idx)}
                        onMouseLeave={() => setSelectedMonthIndex(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Active Point Tooltip */}
              {selectedMonthIndex !== null && (
                <div
                  className="absolute z-20 bg-[#0F1219] border border-[#242933] text-white px-2.5 py-1.5 rounded-md text-[11px] font-data-mono shadow-2xl pointer-events-none -translate-x-1/2 -translate-y-full mb-2"
                  style={{
                    left: `${(points[selectedMonthIndex].x / chartWidth) * 100}%`,
                    top: `${points[selectedMonthIndex].y}px`,
                  }}
                >
                  <div className="font-bold text-gray-200">{points[selectedMonthIndex].month}</div>
                  <div className="text-emerald-400 font-semibold">${points[selectedMonthIndex].revenue}M Revenue</div>
                  <div className="text-gray-400">{points[selectedMonthIndex].orders} Orders</div>
                </div>
              )}
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 font-data-mono px-4 pt-2 border-t border-gray-200 dark:border-[#242933]">
              {trendData.map((d, i) => (
                <button
                  key={d.month}
                  onClick={() => setSelectedMonthIndex(i)}
                  className={`hover:text-emerald-500 transition-colors ${
                    selectedMonthIndex === i ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''
                  }`}
                >
                  {d.month}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Volume by Region Map & Legend */}
        <div
          id="map-volume-by-region"
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-6 shadow-sm flex flex-col min-h-[380px]"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
              Volume by Region
            </h3>
            <span className="material-symbols-outlined text-gray-400 text-[20px]">
              public
            </span>
          </div>

          {/* Interactive World Distribution Map Graphic */}
          <div className="flex-1 w-full relative rounded-lg overflow-hidden border border-gray-200 dark:border-[#242933] bg-[#1C222D]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAklvK_zfHTBhjDJF9KHD-Eh46A9Jd6BPMYKYUqsn0gle7kse7p0JOZocByx2QFyIXPwa0KMXRevsHi-lH0S6fqU5CEKpRYbwuON0u4nQhCsyCAKKnT7y_EP-idb7xgSqioNvOeM1NMtXvgk7dm_J8nFQH0CTOCjpTmAnuU1a3TTFsD15Kn9X937lvH9rzLSaJpuekyj3eisoUYNUIc6DApZKRjNXL0PufOiGGDVTCnWOQ72XgWon5"
              alt="Global logistics distribution heatmap"
              className="w-full h-full object-cover absolute inset-0 opacity-70 dark:opacity-35"
            />

            {/* Map Markers Overlay */}
            {/* North America Hotspot */}
            <div
              onClick={() => {
                setActiveRegion('North America');
                goToOrders('North America');
              }}
              className="absolute top-[32%] left-[22%] flex flex-col items-center cursor-pointer group"
              title="Click to view North America orders"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-md relative z-10 animate-pulse group-hover:scale-125 transition-transform" />
              <div className="bg-white dark:bg-[#151921] text-[10px] font-bold px-2 py-0.5 rounded shadow-lg mt-1 absolute top-4 whitespace-nowrap text-gray-900 dark:text-white border border-gray-200 dark:border-[#242933]">
                NA: 45%
              </div>
            </div>

            {/* Europe Hotspot */}
            <div
              onClick={() => {
                setActiveRegion('Europe');
                goToOrders('Europe');
              }}
              className="absolute top-[38%] left-[52%] flex flex-col items-center cursor-pointer group"
              title="Click to view Europe orders"
            >
              <div className="w-3 h-3 rounded-full bg-blue-400 border-2 border-white shadow-md relative z-10 group-hover:scale-125 transition-transform" />
              <div className="bg-white dark:bg-[#151921] text-[10px] font-bold px-2 py-0.5 rounded shadow-lg mt-1 absolute top-3.5 whitespace-nowrap text-gray-900 dark:text-white border border-gray-200 dark:border-[#242933]">
                EU: 30%
              </div>
            </div>

            {/* Asia Pacific Hotspot */}
            <div
              onClick={() => {
                setActiveRegion('Asia Pacific');
                goToOrders('Asia Pacific');
              }}
              className="absolute top-[56%] left-[76%] flex flex-col items-center cursor-pointer group"
              title="Click to view Asia Pacific orders"
            >
              <div className="w-3 h-3 rounded-full bg-orange-400 border border-white shadow-md relative z-10 group-hover:scale-125 transition-transform" />
              <div className="bg-white dark:bg-[#151921] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg mt-1 absolute top-3 whitespace-nowrap text-gray-900 dark:text-white border border-gray-200 dark:border-[#242933]">
                APAC: 25%
              </div>
            </div>
          </div>

          {/* Region Legend */}
          <div className="mt-4 flex flex-col gap-2">
            {overview.volumeByRegion.map(reg => (
              <div
                key={reg.region}
                onClick={() => {
                  setActiveRegion(reg.region);
                  goToOrders(reg.region);
                }}
                className={`flex justify-between items-center text-[12px] p-2 rounded-lg cursor-pointer transition-colors ${
                  activeRegion === reg.region
                    ? 'bg-gray-100 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933]'
                    : 'hover:bg-gray-50 dark:hover:bg-[#1C222D]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: reg.color === '#000000' ? '#10b981' : reg.color }}
                  />
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {reg.region}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">({reg.activeShipments} active)</span>
                  <span className="font-data-mono font-bold text-gray-900 dark:text-white">
                    {reg.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sections: Recent Activity & Top Performing Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Timeline Feed */}
        <div
          id="section-recent-activity"
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
              Logistics (3PL) Live Feed
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Live Stream
            </span>
          </div>

          <div className="relative pl-2 space-y-3.5 flex-1">
            {overview.recentActivities.map(act => (
              <div
                key={act.id}
                onClick={() => goToLogistics()}
                className="flex items-start gap-3.5 p-3 rounded-lg bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] cursor-pointer hover:border-emerald-500/50 transition-colors"
              >
                <div
                  className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                    act.type === 'delivery'
                      ? 'bg-emerald-400'
                      : act.type === 'alert'
                      ? 'bg-orange-400'
                      : 'bg-blue-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-900 dark:text-gray-200 truncate">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                    {act.description}
                  </p>
                  <span className="text-[10px] font-data-mono text-gray-400 mt-1 block">
                    {act.timeAgo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Products Table */}
        <div
          id="section-top-products"
          className="lg:col-span-2 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-gray-200 dark:border-[#242933] flex justify-between items-center bg-white dark:bg-[#151921]">
            <div>
              <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                Top Performing Products
              </h3>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Highest volume inventory items ranked by quarterly revenue
              </p>
            </div>
            <button
              onClick={goToInventory}
              className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View All Inventory →
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[550px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#242933] bg-gray-50 dark:bg-[#1C222D]">
                  <th className="p-3 pl-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PRODUCT NAME</th>
                  <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                  <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">UNITS SOLD</th>
                  <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">REVENUE</th>
                  <th className="p-3 pr-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">TREND</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#242933] text-[13px]">
                {overview.topProducts.map(prod => (
                  <tr
                    key={prod.id}
                    onClick={goToInventory}
                    className="hover:bg-gray-50 dark:hover:bg-[#1C222D] transition-colors cursor-pointer group"
                  >
                    <td className="p-3 pl-5 flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-gray-100 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] flex items-center justify-center shrink-0 text-emerald-500">
                        <span className="material-symbols-outlined text-[16px]">{prod.icon}</span>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-200 group-hover:text-emerald-500 transition-colors">
                        {prod.name}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500 dark:text-gray-400 font-data-mono">
                      {prod.sku}
                    </td>
                    <td className="p-3 text-right font-data-mono font-medium text-gray-900 dark:text-gray-200">
                      {prod.unitsSold.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-data-mono font-bold text-gray-900 dark:text-white">
                      ${(prod.revenue / 1000).toFixed(0)}K
                    </td>
                    <td className="p-3 pr-5 text-center">
                      <span
                        className={`material-symbols-outlined text-[17px] ${
                          prod.trend === 'up'
                            ? 'text-emerald-500'
                            : prod.trend === 'down'
                            ? 'text-rose-500'
                            : 'text-amber-500'
                        }`}
                      >
                        {prod.trend === 'up'
                          ? 'trending_up'
                          : prod.trend === 'down'
                          ? 'trending_down'
                          : 'trending_flat'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
