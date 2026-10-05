import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, Region, UserProfile } from '../../types';

interface OrdersViewProps {
  orders: Order[];
  currentUser: UserProfile;
  onOpenCreateOrder?: () => void;
  onOpenCreateModal?: () => void;
  onSelectOrderDetails?: (order: Order) => void;
  onSelectOrder?: (order: Order) => void;
  onTrack3PL: (waybillNo: string) => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  onBulkUpdate?: (ids: string[], action: string, status?: OrderStatus) => void;
  onExportCsv: (filteredOrders?: Order[]) => void;
  onExportPdf: (filteredOrders?: Order[]) => void;
  initialRegionFilter?: Region;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  currentUser,
  onOpenCreateOrder,
  onOpenCreateModal,
  onSelectOrderDetails,
  onSelectOrder,
  onTrack3PL,
  onUpdateOrderStatus,
  onBulkUpdate,
  onExportCsv,
  onExportPdf,
  initialRegionFilter,
}) => {
  const handleCreateClick = onOpenCreateOrder || onOpenCreateModal || (() => {});
  const handleSelectOrder = onSelectOrderDetails || onSelectOrder || (() => {});
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [regionFilter, setRegionFilter] = useState<string>(initialRegionFilter || 'All');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [carrierFilter, setCarrierFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'All' && order.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Region filter
      if (regionFilter !== 'All' && !order.region.toLowerCase().includes(regionFilter.toLowerCase())) {
        return false;
      }
      // Carrier filter
      if (carrierFilter !== 'All' && order.carrier !== carrierFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(q);
        const matchesCust = order.customerName.toLowerCase().includes(q);
        const matchesWaybill = order.waybillNo?.toLowerCase().includes(q);
        if (!matchesId && !matchesCust && !matchesWaybill) return false;
      }
      return true;
    });
  }, [orders, statusFilter, regionFilter, carrierFilter, searchQuery]);

  // Paginated records
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrderIds(paginatedOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedOrderIds(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

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
      case 'Cancelled':
        return 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div id="orders-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[26px] md:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
              Order Management
            </h2>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/30">
              Live Allocation
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
            Track, filter, and allocate sales &amp; distribution orders across global fulfillment nodes.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="btn-orders-export-pdf"
            onClick={() => onExportPdf(filteredOrders)}
            className="px-3.5 py-2 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#242933] transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px] text-rose-500">picture_as_pdf</span>
            Export PDF
          </button>

          <button
            id="btn-orders-export-csv"
            onClick={() => onExportCsv(filteredOrders)}
            className="px-3.5 py-2 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#242933] transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[17px] text-emerald-500">download</span>
            Export CSV
          </button>

          <button
            id="btn-orders-new-order"
            onClick={handleCreateClick}
            disabled={!currentUser.permissions.canCreateOrders}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Order
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl shadow-sm overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-[#242933] flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-[#1C222D]">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="relative">
              <select
                id="filter-order-status"
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">Status: All</option>
                <option value="Processing">Status: Processing</option>
                <option value="Shipped">Status: Shipped</option>
                <option value="Delivered">Status: Delivered</option>
                <option value="On Hold">Status: On Hold</option>
                <option value="Disputed">Status: Disputed</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Date Range Filter */}
            <div className="relative">
              <select
                id="filter-order-date"
                value={dateRangeFilter}
                onChange={e => setDateRangeFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option>Date Range: Last 30 Days</option>
                <option>Date Range: This Quarter</option>
                <option>Date Range: Last 6 Months</option>
                <option>Date Range: Year to Date</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Region Filter */}
            <div className="relative">
              <select
                id="filter-order-region"
                value={regionFilter}
                onChange={e => {
                  setRegionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">Region: All</option>
                <option value="North America">Region: North America</option>
                <option value="Europe">Region: Europe</option>
                <option value="Asia Pacific">Region: Asia Pacific</option>
                <option value="Latin America">Region: Latin America</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* More Filters Toggle */}
            <button
              id="btn-more-filters"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`px-3 py-1.5 border rounded-lg text-[12px] font-medium flex items-center gap-1 transition-colors ${
                carrierFilter !== 'All'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'bg-white dark:bg-[#151921] border-gray-200 dark:border-[#242933] text-gray-800 dark:text-gray-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              More Filters
              {carrierFilter !== 'All' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
            </button>

            {/* Bulk Actions Menu */}
            {selectedOrderIds.length > 0 && (
              <div className="relative">
                <button
                  id="btn-bulk-actions"
                  onClick={() => setShowBulkMenu(!showBulkMenu)}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[12px] font-semibold flex items-center gap-1 shadow-sm animate-fade-in"
                >
                  Bulk Actions ({selectedOrderIds.length})
                  <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                </button>

                {showBulkMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowBulkMenu(false)} />
                    <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl shadow-2xl z-40 p-1.5 text-[12px]">
                      <button
                        onClick={() => {
                          onBulkUpdate(selectedOrderIds, 'update_status', 'Shipped');
                          setShowBulkMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D] text-gray-800 dark:text-gray-200"
                      >
                        Mark as Shipped
                      </button>
                      <button
                        onClick={() => {
                          onBulkUpdate(selectedOrderIds, 'update_status', 'Delivered');
                          setShowBulkMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D] text-gray-800 dark:text-gray-200"
                      >
                        Mark as Delivered
                      </button>
                      <button
                        onClick={() => {
                          onBulkUpdate(selectedOrderIds, 'update_status', 'On Hold');
                          setShowBulkMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D] text-gray-800 dark:text-gray-200"
                      >
                        Place on Hold
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search in table..."
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 w-48 sm:w-56"
            />
          </div>
        </div>

        {/* More Filters Drawer */}
        {showMoreFilters && (
          <div className="p-3.5 bg-gray-100 dark:bg-[#1C222D] border-b border-gray-200 dark:border-[#242933] flex items-center gap-4 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-600 dark:text-gray-300">Carrier:</span>
              <select
                value={carrierFilter}
                onChange={e => setCarrierFilter(e.target.value)}
                className="px-2 py-1 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-md text-[12px] text-gray-800 dark:text-gray-200"
              >
                <option value="All">All Carriers</option>
                <option value="FedEx Freight">FedEx Freight</option>
                <option value="DHL Global Forwarding">DHL Global Forwarding</option>
                <option value="Maersk Logistics">Maersk Logistics</option>
              </select>
            </div>
            {carrierFilter !== 'All' && (
              <button
                onClick={() => setCarrierFilter('All')}
                className="text-[12px] text-rose-500 hover:underline"
              >
                Clear extra filters
              </button>
            )}
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#242933] bg-gray-50 dark:bg-[#1C222D]">
                <th className="p-3 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedOrders.length > 0 &&
                      paginatedOrders.every(o => selectedOrderIds.includes(o.id))
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 dark:border-[#242933] text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ORDER ID</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CUSTOMER</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">DATE</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">STATUS</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">TOTAL AMOUNT</th>
                <th className="p-3 pr-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#242933] text-[13px]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No orders matching selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map(order => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50 dark:hover:bg-[#1C222D] transition-colors group ${
                        isSelected ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 pl-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(order.id)}
                          className="rounded border-gray-300 dark:border-[#242933] text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Order ID */}
                      <td className="p-3">
                        <button
                          onClick={() => handleSelectOrder(order)}
                          className="font-data-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          {order.id}
                        </button>
                        {order.waybillNo && (
                          <div className="text-[11px] text-gray-400 font-data-mono truncate">
                            {order.waybillNo}
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${order.customerAvatarBg}`}
                          >
                            {order.customerInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-200">
                              {order.customerName}
                            </div>
                            <div className="text-[11px] text-gray-400">{order.region}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {order.date}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="p-3 text-right font-data-mono font-bold text-gray-900 dark:text-white">
                        ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions */}
                      <td className="p-3 pr-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleSelectOrder(order)}
                            className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-[#242933] rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          {order.waybillNo && (
                            <button
                              onClick={() => onTrack3PL(order.waybillNo!)}
                              className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-[#242933] rounded-lg transition-colors"
                              title="Track 3PL Shipment"
                            >
                              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                            </button>
                          )}

                          {currentUser.permissions.canEditOrders && (
                            <select
                              value={order.status}
                              onChange={e => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="text-[11px] bg-transparent border-none text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer focus:outline-none"
                              title="Quick Change Status"
                            >
                              <option value="Processing">Set: Processing</option>
                              <option value="Shipped">Set: Shipped</option>
                              <option value="Delivered">Set: Delivered</option>
                              <option value="On Hold">Set: On Hold</option>
                              <option value="Disputed">Set: Disputed</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-[#242933] flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50 dark:bg-[#1C222D] text-[12px] text-gray-500 dark:text-gray-400">
          <div>
            Showing <span className="font-semibold text-gray-900 dark:text-gray-100">1</span> to{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{paginatedOrders.length}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">1,204 results</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] hover:bg-gray-100 dark:hover:bg-[#242933] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(3, totalPages) }).map((_, idx) => {
              const p = idx + 1;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-[12px] font-semibold transition-colors ${
                    currentPage === p
                      ? 'bg-emerald-600 text-white'
                      : 'border border-gray-200 dark:border-[#242933] hover:bg-gray-100 dark:hover:bg-[#242933]'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] hover:bg-gray-100 dark:hover:bg-[#242933] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
