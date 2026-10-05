import React, { useState } from 'react';
import { Customer, Order, OrderStatus } from '../../types';

interface CustomersViewProps {
  customers: Customer[];
  selectedCustomer: Customer;
  onSelectCustomer: (customer: Customer) => void;
  orders: Order[];
  onSelectOrderDetails: (order: Order) => void;
  onTrack3PL: (waybillNo: string) => void;
  onOpenCreateOrderForCustomer: (customer: Customer) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  orders,
  onSelectOrderDetails,
  onTrack3PL,
  onOpenCreateOrderForCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'analytics' | 'disputes'>('orders');

  const customerOrders = orders.filter(o => o.customerId === selectedCustomer.id);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'Shipped':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20';
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'On Hold':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'Disputed':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div id="customers-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Customer Switcher Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[26px] md:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
              Customer 360 View
            </h2>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/30">
              Account Intelligence
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
            Holistic account profile, credit utilization, and distribution order timeline.
          </p>
        </div>

        {/* Customer Select Dropdown */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <select
              id="select-customer-360"
              value={selectedCustomer.id}
              onChange={e => {
                const found = customers.find(c => c.id === e.target.value);
                if (found) onSelectCustomer(found);
              }}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
              expand_more
            </span>
          </div>

          <button
            id="btn-create-order-for-cust"
            onClick={() => onOpenCreateOrderForCustomer(selectedCustomer)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Order for {selectedCustomer.code}
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Profile, Financial Overview & HQ Map */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Primary Profile Card */}
          <div
            id="card-customer-profile"
            className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-13 h-13 rounded-full flex items-center justify-center font-bold text-[16px] shrink-0 ${selectedCustomer.id === 'CUST-89234' ? 'bg-gray-800 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}
              >
                {selectedCustomer.initials}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                  {selectedCustomer.name}
                </h3>
                <div className="text-[12px] font-data-mono text-gray-400">
                  {selectedCustomer.id}
                </div>
                <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {selectedCustomer.tier}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-[#242933] space-y-2.5 text-[13px]">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  PRIMARY CONTACT
                </span>
                <div className="font-semibold text-gray-900 dark:text-gray-200 mt-0.5">
                  {selectedCustomer.primaryContact.name}
                </div>
                <div className="text-[12px] text-gray-500 dark:text-gray-400">
                  {selectedCustomer.primaryContact.title}
                </div>
                <div className="text-[12px] text-emerald-600 dark:text-emerald-400 truncate mt-0.5 font-medium">
                  {selectedCustomer.primaryContact.email}
                </div>
                <div className="text-[12px] text-gray-500 dark:text-gray-400 font-data-mono">
                  {selectedCustomer.primaryContact.phone}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-[#242933] flex items-center justify-between">
                <span className="text-[12px] text-gray-500 dark:text-gray-400">Account Status:</span>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {selectedCustomer.accountStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Financial Overview */}
          <div
            id="card-customer-financials"
            className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm"
          >
            <h4 className="text-[14px] font-bold text-gray-900 dark:text-white mb-3">
              Financial Overview
            </h4>

            <div className="space-y-3.5 text-[13px]">
              <div>
                <div className="flex justify-between items-center text-[12px] mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Credit Limit:</span>
                  <span className="font-data-mono font-bold text-gray-900 dark:text-white">
                    ${selectedCustomer.financials.creditLimit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[12px] mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Credit Utilized:</span>
                  <span className="font-data-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    ${selectedCustomer.financials.creditUtilized.toLocaleString()} ({selectedCustomer.financials.creditUtilizedPct}%)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 dark:bg-[#1C222D] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      selectedCustomer.financials.creditUtilizedPct > 85 ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedCustomer.financials.creditUtilizedPct}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-[#242933] flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Payment Terms:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-200">
                  {selectedCustomer.financials.paymentTerms}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Avg Days to Pay:</span>
                <span className="font-data-mono font-semibold text-gray-900 dark:text-gray-200">
                  {selectedCustomer.financials.avgDaysToPay} Days
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: HQ Location Card */}
          <div
            id="card-customer-hq"
            className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-[13px] font-bold text-gray-900 dark:text-white">
                Headquarters
              </span>
              <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {selectedCustomer.headquarters.city}, {selectedCustomer.headquarters.country}
              </span>
            </div>

            <div className="relative h-28 rounded-lg overflow-hidden border border-gray-200 dark:border-[#242933] bg-gray-100 dark:bg-[#1C222D]">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAklvK_zfHTBhjDJF9KHD-Eh46A9Jd6BPMYKYUqsn0gle7kse7p0JOZocByx2QFyIXPwa0KMXRevsHi-lH0S6fqU5CEKpRYbwuON0u4nQhCsyCAKKnT7y_EP-idb7xgSqioNvOeM1NMtXvgk7dm_J8nFQH0CTOCjpTmAnuU1a3TTFsD15Kn9X937lvH9rzLSaJpuekyj3eisoUYNUIc6DApZKRjNXL0PufOiGGDVTCnWOQ72XgWon5"
                alt="Map thumbnail"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-emerald-600 text-white p-1.5 rounded-full shadow-lg">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 truncate">
              {selectedCustomer.headquarters.mapQuery}
            </p>
          </div>
        </div>

        {/* Right Column (8 cols): Bento KPIs, Tabs, Order History & Affinity */}
        <div className="lg:col-span-8 space-y-5">
          {/* Quick Stats Bento (3 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* KPI 1: YTD Revenue */}
            <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">YTD REVENUE</span>
              <div className="text-[26px] font-bold text-gray-900 dark:text-white mt-1">
                ${(selectedCustomer.financials.ytdRevenue / 1000000).toFixed(1)}M
              </div>
              <div className="text-[12px] font-semibold text-emerald-500 mt-0.5">
                +14.5% vs last year
              </div>
            </div>

            {/* KPI 2: Open Orders */}
            <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">OPEN ORDERS</span>
              <div className="text-[26px] font-bold text-gray-900 dark:text-white mt-1">
                {selectedCustomer.financials.openOrdersCount}
              </div>
              <div className="text-[12px] text-gray-400 mt-0.5">
                ${(selectedCustomer.financials.openOrdersValue / 1000).toFixed(0)}k Total Value
              </div>
            </div>

            {/* KPI 3: Active Disputes */}
            <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ACTIVE DISPUTES</span>
              <div className="text-[26px] font-bold text-rose-500 mt-1">
                {selectedCustomer.financials.activeDisputesCount}
              </div>
              <div className="text-[12px] font-semibold text-rose-500 mt-0.5">
                {selectedCustomer.financials.activeDisputesCount > 0 ? 'Requires Resolution' : 'No active disputes'}
              </div>
            </div>
          </div>

          {/* Tabbed View Container */}
          <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-[#242933] px-4 bg-gray-50 dark:bg-[#1C222D]">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-4 text-[12px] font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Order History
                <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-gray-200 dark:bg-[#242933] font-data-mono">
                  {customerOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 px-4 text-[12px] font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'analytics'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Category Affinities
              </button>

              <button
                onClick={() => setActiveTab('disputes')}
                className={`py-3 px-4 text-[12px] font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'disputes'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Active Disputes
                {selectedCustomer.disputes.length > 0 && (
                  <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold">
                    {selectedCustomer.disputes.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab 1: Order History */}
            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[650px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-[#242933] bg-gray-50 dark:bg-[#1C222D]">
                      <th className="p-3 pl-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ORDER ID</th>
                      <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">DATE</th>
                      <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">STATUS</th>
                      <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ITEMS</th>
                      <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">TOTAL</th>
                      <th className="p-3 pr-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#242933] text-[13px]">
                    {customerOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-gray-400">
                          No orders on record for this customer.
                        </td>
                      </tr>
                    ) : (
                      customerOrders.map(order => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 dark:hover:bg-[#1C222D] transition-colors"
                        >
                          <td className="p-3 pl-4 font-data-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {order.id}
                          </td>
                          <td className="p-3 text-gray-500 dark:text-gray-400">
                            {order.date}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusBadge(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="p-3 text-gray-500 dark:text-gray-400">
                            {order.itemSummary}
                          </td>
                          <td className="p-3 text-right font-data-mono font-bold text-gray-900 dark:text-white">
                            ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 pr-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => onSelectOrderDetails(order)}
                                className="p-1 text-gray-400 hover:text-emerald-500 rounded"
                                title="View Order"
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                              {order.waybillNo && (
                                <button
                                  onClick={() => onTrack3PL(order.waybillNo!)}
                                  className="p-1 text-gray-400 hover:text-emerald-500 rounded"
                                  title="Track 3PL"
                                >
                                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Category Affinities Breakdown */}
            {activeTab === 'analytics' && (
              <div className="p-5 space-y-4">
                <h4 className="text-[14px] font-bold text-gray-900 dark:text-white">
                  Product Category Purchasing Affinity
                </h4>
                <p className="text-[12px] text-gray-400">
                  Historical order composition and volume breakdown for {selectedCustomer.name}.
                </p>

                <div className="space-y-3 pt-2">
                  {selectedCustomer.productAffinities.map(aff => (
                    <div key={aff.category} className="space-y-1">
                      <div className="flex justify-between text-[12px] font-semibold">
                        <span className="text-gray-800 dark:text-gray-200">{aff.category}</span>
                        <span className="font-data-mono text-emerald-500">{aff.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-[#1C222D] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${aff.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Active Disputes */}
            {activeTab === 'disputes' && (
              <div className="p-5 space-y-3">
                <h4 className="text-[14px] font-bold text-gray-900 dark:text-white">
                  Audit &amp; Claims Tickets
                </h4>
                {selectedCustomer.disputes.length === 0 ? (
                  <p className="text-[13px] text-gray-400 py-4 text-center">
                    No active disputes or claims recorded for this account.
                  </p>
                ) : (
                  selectedCustomer.disputes.map(disp => (
                    <div
                      key={disp.id}
                      className="p-3.5 bg-gray-50 dark:bg-[#1C222D] rounded-lg border border-gray-200 dark:border-[#242933] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-data-mono font-bold text-rose-500">
                            {disp.id}
                          </span>
                          <span className="text-[12px] font-data-mono text-gray-400">
                            (Order: {disp.orderId})
                          </span>
                        </div>
                        <p className="text-[13px] text-gray-900 dark:text-white mt-1 font-medium">
                          {disp.reason}
                        </p>
                        <span className="text-[11px] text-gray-400">Assigned to: {disp.assignedTo}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-data-mono font-bold text-rose-500">
                          ${disp.amount.toFixed(2)}
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {disp.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
