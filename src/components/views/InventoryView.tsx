import React, { useState, useMemo } from 'react';
import { InventoryItem, Warehouse, InventoryStatus, UserProfile } from '../../types';

interface InventoryViewProps {
  items: InventoryItem[];
  warehouse: Warehouse;
  warehouses: Warehouse[];
  currentUser: UserProfile;
  onSelectWarehouse: (id: string) => void;
  onOpenTransferModal: (item?: InventoryItem) => void;
  onOpenRestockModal: (item?: InventoryItem) => void;
  onSync3PL: () => void;
  isSyncing3PL: boolean;
  onExportCsv: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  items,
  warehouse,
  warehouses,
  currentUser,
  onSelectWarehouse,
  onOpenTransferModal,
  onOpenRestockModal,
  onSync3PL,
  isSyncing3PL,
  onExportCsv,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All Categories');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 7;

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (categoryFilter !== 'All Categories' && item.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== 'All' && item.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.sku.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [items, categoryFilter, statusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'Optimal':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'Low Stock':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'Critical':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'Overstock':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
  };

  return (
    <div id="inventory-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-[26px] md:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
              Inventory Management
            </h2>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/30">
              Live Stock Feed
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time multi-warehouse tracking, capacity telemetry, and 3PL replenishment.
          </p>
        </div>

        {/* Warehouse Selector & Top CTAs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Warehouse Dropdown */}
          <div className="relative">
            <select
              id="select-warehouse-location"
              value={warehouse.id}
              onChange={e => onSelectWarehouse(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
              warehouse
            </span>
          </div>

          {/* 3PL Sync Button */}
          <button
            id="btn-sync-3pl-inventory"
            onClick={onSync3PL}
            disabled={isSyncing3PL}
            className="px-3 py-2 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#242933] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            title="Trigger 3PL WMS sync"
          >
            <span className={`material-symbols-outlined text-[17px] ${isSyncing3PL ? 'animate-spin text-emerald-500' : 'text-emerald-500'}`}>
              sync
            </span>
            {isSyncing3PL ? 'Syncing...' : 'Sync 3PL WMS'}
          </button>

          {/* Transfer Stock Button */}
          <button
            id="btn-open-transfer-stock"
            onClick={() => onOpenTransferModal()}
            disabled={!currentUser.permissions.canTransferStock}
            className="px-3.5 py-2 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#242933] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[17px]">swap_horiz</span>
            Transfer Stock
          </button>

          {/* Request Restock Button */}
          <button
            id="btn-open-request-restock"
            onClick={() => onOpenRestockModal()}
            disabled={!currentUser.permissions.canRequestRestock}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Request Restock
          </button>
        </div>
      </div>

      {/* Bento Grid: 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Warehouse Capacity */}
        <div
          id="card-warehouse-capacity"
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">WAREHOUSE CAPACITY</span>
            <span className="material-symbols-outlined text-gray-400 text-[18px]">
              inventory
            </span>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              {warehouse.utilizationPct}%
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
              {warehouse.usedCapacityPallets.toLocaleString()} / {warehouse.totalCapacityPallets.toLocaleString()} Pallets
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 dark:bg-[#1C222D] h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${warehouse.utilizationPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Stock Health */}
        <div
          id="card-stock-health"
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">STOCK HEALTH</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              {warehouse.stockHealthPct}%
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-500 mt-1">
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
              <span>+1.8% this week</span>
            </div>
          </div>
        </div>

        {/* Card 3: Critical Items */}
        <div
          id="card-critical-items"
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CRITICAL ITEMS</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-rose-500 leading-tight">
              {warehouse.criticalItemsCount}
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Requires immediate reorder
            </div>
          </div>
        </div>

        {/* Card 4: Incoming Deliveries */}
        <div
          id="card-incoming-deliveries"
          className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">INCOMING DELIVERIES</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            </div>
          </div>
          <div>
            <div className="text-[28px] font-bold text-gray-900 dark:text-white leading-tight">
              {warehouse.incomingDeliveriesCount}
            </div>
            <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
              Expected within 48h ({warehouse.partner3PL})
            </div>
          </div>
        </div>
      </div>

      {/* Stock List Table Container */}
      <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-[#242933] flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-[#1C222D]">
          <div className="flex items-center gap-3">
            <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
              Detailed Stock List
            </h3>
            <span className="text-[12px] text-gray-400">({warehouse.name})</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="relative">
              <select
                id="filter-inventory-category"
                value={categoryFilter}
                onChange={e => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option>All Categories</option>
                <option>Electronics</option>
                <option>Components</option>
                <option>Hardware</option>
                <option>Packaging</option>
                <option>Industrial</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                id="filter-inventory-status"
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Optimal">Optimal</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical">Critical</option>
                <option value="Overstock">Overstock</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search SKU or product name..."
                className="pl-8 pr-3 py-1.5 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 w-52 sm:w-60"
              />
            </div>

            <button
              onClick={onExportCsv}
              className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-[#242933] rounded-lg transition-colors"
              title="Export Inventory Stock CSV"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
          </div>
        </div>

        {/* Inventory Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#242933] bg-gray-50 dark:bg-[#1C222D]">
                <th className="p-3 pl-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">SKU</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PRODUCT NAME</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CATEGORY</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">IN STOCK</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">COMMITTED</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">INCOMING</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">UNIT COST</th>
                <th className="p-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">STATUS</th>
                <th className="p-3 pr-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#242933] text-[13px]">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No inventory records match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedItems.map(item => (
                  <tr
                    key={item.sku}
                    className="hover:bg-gray-50 dark:hover:bg-[#1C222D] transition-colors"
                  >
                    <td className="p-3 pl-4 font-data-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.sku}
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-gray-900 dark:text-gray-200">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Reorder point: {item.reorderPoint} units
                      </div>
                    </td>
                    <td className="p-3 text-gray-500 dark:text-gray-400">
                      {item.category}
                    </td>
                    <td className="p-3 text-right font-data-mono font-bold text-gray-900 dark:text-white">
                      {item.inStock.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-data-mono text-gray-400">
                      {item.committed.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-data-mono text-emerald-500 font-semibold">
                      +{item.incoming.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-data-mono text-gray-900 dark:text-gray-200">
                      ${item.unitCost.toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenTransferModal(item)}
                          disabled={!currentUser.permissions.canTransferStock}
                          className="px-2.5 py-1 bg-white dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded text-[11px] font-medium hover:bg-gray-50 dark:hover:bg-[#242933] text-gray-800 dark:text-gray-200 transition-colors disabled:opacity-40"
                          title="Transfer to another warehouse"
                        >
                          Transfer
                        </button>
                        <button
                          onClick={() => onOpenRestockModal(item)}
                          disabled={!currentUser.permissions.canRequestRestock}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-40"
                          title="Restock Purchase Order"
                        >
                          Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#242933] flex flex-col sm:flex-row justify-between items-center gap-3 bg-gray-50 dark:bg-[#1C222D] text-[12px] text-gray-500 dark:text-gray-400">
          <div>
            Showing <span className="font-semibold text-gray-900 dark:text-gray-100">1</span> to{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{paginatedItems.length}</span> of{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">1,240 items</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] hover:bg-gray-100 dark:hover:bg-[#242933] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] hover:bg-gray-100 dark:hover:bg-[#242933] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
