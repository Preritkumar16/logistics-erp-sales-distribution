import React, { useState } from 'react';
import { AnalyticsOverview } from '../../types';

interface AnalyticsViewProps {
  analytics: AnalyticsOverview;
  onExportPdf: () => void;
  onExportCsv: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  onExportPdf,
  onExportCsv,
}) => {
  const [dateRange, setDateRange] = useState<string>('Jan 2024 - Jun 2024');
  const [selectedMetric, setSelectedMetric] = useState<'Volume' | 'Revenue' | 'Margin'>('Volume');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const forecastData = analytics.salesForecasting;
  const maxForecast = 100000;

  return (
    <div id="analytics-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[26px] md:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
              Analytics &amp; Reporting
            </h2>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/30">
              Live BI Engine
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
            Deep-dive metrics, forecasting models, and performance tracking.
          </p>
        </div>

        {/* Top Filter & Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <select
              id="select-analytics-daterange"
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
            >
              <option>Jan 2024 - Jun 2024</option>
              <option>Jul 2024 - Dec 2024</option>
              <option>Full Year 2024</option>
              <option>Rolling 12 Months</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
              calendar_today
            </span>
          </div>

          <button
            id="btn-analytics-export-pdf"
            onClick={onExportPdf}
            className="px-3.5 py-2 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#242933] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-rose-500">picture_as_pdf</span>
            Export PDF
          </button>

          <button
            id="btn-analytics-export-csv"
            onClick={onExportCsv}
            className="px-3.5 py-2 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#242933] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-500">table_chart</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Bento KPI Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">TOTAL REVENUE</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <span className="material-symbols-outlined text-[18px]">attach_money</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              ${(analytics.kpis.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-500 mt-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+{analytics.kpis.revenueGrowthPct}% vs last period</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACTIVE ORDERS</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              {analytics.kpis.activeOrders.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-500 mt-1">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+{analytics.kpis.ordersGrowthPct}% vs last period</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">AVG FULFILLMENT TIME</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              {analytics.kpis.avgFulfillmentDays} Days
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-500 mt-1">
              <span className="material-symbols-outlined text-[16px]">trending_down</span>
              <span>{analytics.kpis.fulfillmentChangePct}% faster</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CUSTOMER SATISFACTION</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
              <span className="material-symbols-outlined text-[18px]">thumb_up</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              {analytics.kpis.customerSatisfactionPct}%
            </div>
            <div className="flex items-center gap-1 text-[12px] font-medium text-gray-400 mt-1">
              <span>0% vs last period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Sales Forecasting Bar Chart + Fulfillment Accuracy Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Forecasting (2 cols) */}
        <div
          id="section-sales-forecasting"
          className="lg:col-span-2 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[360px]"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
                Sales Forecasting
              </h3>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Actual vs. projected monthly sales volumes
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[12px]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                <span className="text-gray-600 dark:text-gray-400">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-emerald-500/30 dark:bg-emerald-500/30 rounded-sm" />
                <span className="text-gray-600 dark:text-gray-400">Projected</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="flex-1 w-full bg-gray-50 dark:bg-[#1C222D] rounded-xl border border-gray-200 dark:border-[#242933] p-4 flex flex-col justify-between">
            {/* Chart Bars */}
            <div className="flex-1 flex items-end justify-around gap-4 pt-6 pb-2 relative">
              {forecastData.map((item, index) => {
                const amount = item.actualAmount || item.projectedAmount || 0;
                const heightPct = (amount / maxForecast) * 100;
                const isActual = Boolean(item.actualAmount);
                const isHovered = hoveredBar === index;

                return (
                  <div
                    key={item.month}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="flex-1 flex flex-col items-center max-w-[60px] h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-7 z-20 bg-gray-900 dark:bg-black text-white text-[11px] font-data-mono font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap border border-[#242933]">
                        ${amount.toLocaleString()} ({isActual ? 'Actual' : 'Projected'})
                      </div>
                    )}

                    {/* Bar graphic */}
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isActual
                          ? 'bg-emerald-500 group-hover:bg-emerald-400'
                          : 'bg-emerald-500/30 dark:bg-emerald-500/25 group-hover:bg-emerald-500/40'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-around text-[12px] font-medium text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-[#242933]">
              {forecastData.map(item => (
                <div key={item.month} className="text-center">
                  <div>{item.month}</div>
                  <div className="text-[10px] font-data-mono text-gray-400">
                    {item.actualAmount ? `$${item.actualAmount / 1000}k` : `$${(item.projectedAmount || 0) / 1000}k (P)`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fulfillment Accuracy Donut (1 col) */}
        <div
          id="section-fulfillment-accuracy"
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm flex flex-col justify-between min-h-[360px]"
        >
          <div>
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
              Fulfillment Accuracy
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">
              OTIF delivery accuracy distribution
            </p>
          </div>

          {/* Donut Chart Visual */}
          <div className="py-4 flex flex-col items-center justify-center relative">
            <div className="w-40 h-40 rounded-full relative flex items-center justify-center">
              {/* SVG Conic Donut */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="text-gray-200 dark:text-[#242933]"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Errors/Returns Segment (10%) */}
                <path
                  className="text-rose-500"
                  strokeDasharray="10, 100"
                  strokeDashoffset="-90"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Delayed Segment (15%) */}
                <path
                  className="text-amber-500"
                  strokeDasharray="15, 100"
                  strokeDashoffset="-75"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* On Time In Full (75%) */}
                <path
                  className="text-emerald-500"
                  strokeDasharray="75, 100"
                  strokeDashoffset="0"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>

              {/* Center Metric */}
              <div className="absolute flex flex-col items-center">
                <span className="text-[26px] font-bold text-gray-900 dark:text-white">
                  {analytics.fulfillmentAccuracy.onTimeInFullPct}%
                </span>
                <span className="text-[11px] text-gray-400 font-semibold">OTIF Rate</span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2 text-[12px] pt-2 border-t border-gray-200 dark:border-[#242933]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-gray-700 dark:text-gray-300">On Time In Full</span>
              </div>
              <span className="font-data-mono font-bold text-gray-900 dark:text-white">
                {analytics.fulfillmentAccuracy.onTimeInFullPct}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-gray-700 dark:text-gray-300">Delayed</span>
              </div>
              <span className="font-data-mono font-bold text-gray-900 dark:text-white">
                {analytics.fulfillmentAccuracy.delayedPct}%
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-gray-700 dark:text-gray-300">Errors / Returns</span>
              </div>
              <span className="font-data-mono font-bold text-gray-900 dark:text-white">
                {analytics.fulfillmentAccuracy.errorsPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Regional Performance Heatmap Matrix */}
      <div
        id="section-regional-heatmap"
        className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 dark:border-[#242933] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 dark:bg-[#1C222D]">
          <div>
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">
              Regional Performance Heatmap
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">
              Cross-category distribution density by geographic territory
            </p>
          </div>

          <div className="relative">
            <select
              id="select-heatmap-metric"
              value={selectedMetric}
              onChange={e => setSelectedMetric(e.target.value as any)}
              className="appearance-none pl-3.5 pr-8 py-1.5 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Volume">Metric: Volume</option>
              <option value="Revenue">Metric: Revenue</option>
              <option value="Margin">Metric: Margin</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#242933] bg-gray-50 dark:bg-[#1C222D]">
                <th className="p-3.5 pl-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/4">
                  REGION / TERRITORY
                </th>
                <th className="p-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-1/5">
                  ELECTRONICS
                </th>
                <th className="p-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-1/5">
                  APPAREL
                </th>
                <th className="p-3.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-1/5">
                  HOME GOODS
                </th>
                <th className="p-3.5 pr-5 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-1/5">
                  INDUSTRIAL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#242933] text-[13px]">
              {analytics.regionalHeatmap.rows.map(row => (
                <tr key={row.region} className="hover:bg-gray-50 dark:hover:bg-[#1C222D]/60 transition-colors">
                  <td className="p-3.5 pl-5 font-semibold text-gray-900 dark:text-white">
                    {row.region}
                  </td>
                  {row.categories.map((cat, idx) => (
                    <td key={idx} className="p-2 text-center">
                      <div
                        className={`py-2 px-3 rounded-lg font-bold text-[12px] shadow-sm transition-all duration-200 hover:scale-105 ${
                          cat.rating === 'High'
                            ? 'bg-emerald-600 text-white'
                            : cat.rating === 'Med-High'
                            ? 'bg-emerald-500/80 text-white'
                            : cat.rating === 'Med'
                            ? 'bg-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                            : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        }`}
                        title={`${row.region} - ${cat.category}: ${cat.rating} (${cat.value.toLocaleString()} units)`}
                      >
                        {cat.displayLabel}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Heatmap Legend Bar */}
        <div className="p-3.5 border-t border-gray-200 dark:border-[#242933] flex flex-col sm:flex-row justify-between items-center gap-2 bg-gray-50 dark:bg-[#1C222D] text-[12px] text-gray-400">
          <span>Low Density Territory</span>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-3 rounded-sm bg-emerald-500/15" title="Low" />
            <div className="w-6 h-3 rounded-sm bg-emerald-500/30" title="Med" />
            <div className="w-6 h-3 rounded-sm bg-emerald-500/80" title="Med-High" />
            <div className="w-6 h-3 rounded-sm bg-emerald-600" title="High" />
          </div>
          <span>High Volume Territory</span>
        </div>
      </div>
    </div>
  );
};
