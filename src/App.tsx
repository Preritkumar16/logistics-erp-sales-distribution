import React, { useState, useEffect, useCallback } from 'react';
import {
  ViewType,
  UserProfile,
  UserRole,
  Order,
  InventoryItem,
  Warehouse,
  Customer,
  ExecutiveOverview,
  AnalyticsOverview,
  OrderStatus,
} from './types';
import { apiService } from './services/apiService';
import {
  exportOrdersToCsv,
  exportOrdersToPdf,
  exportInventoryToCsv,
  exportAnalyticsToPdf,
  exportAnalyticsToCsv,
  exportOrderInvoiceSlip,
} from './utils/exportUtils';

// Layout Components
import { SideNavBar } from './components/layout/SideNavBar';
import { TopNavBar } from './components/layout/TopNavBar';

// Views
import { DashboardView } from './components/views/DashboardView';
import { OrdersView } from './components/views/OrdersView';
import { InventoryView } from './components/views/InventoryView';
import { CustomersView } from './components/views/CustomersView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { Logistics3PLView } from './components/views/Logistics3PLView';

// Modals
import { CreateOrderModal } from './components/modals/CreateOrderModal';
import { TransferStockModal } from './components/modals/TransferStockModal';
import { RestockModal } from './components/modals/RestockModal';
import { OrderDetailsModal } from './components/modals/OrderDetailsModal';
import { DispatchModal } from './components/modals/DispatchModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { SupportModal } from './components/modals/SupportModal';

export default function App() {
  // Navigation & Theme
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('erp_theme');
    if (saved) return saved === 'dark';
    return true; // Default to Elegant Dark
  });

  // User Profile & Roles (RBAC)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => apiService.getCurrentUser());
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  // Core Data State
  const [dashboardData, setDashboardData] = useState<ExecutiveOverview | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('WH-NA-01');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsOverview | null>(null);

  // 3PL Tracking active focus
  const [activeTrackingWaybill, setActiveTrackingWaybill] = useState<string>('WB-8901-FDX');
  const [isSyncing3PL, setIsSyncing3PL] = useState<boolean>(false);

  // Modals state
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState<boolean>(false);
  const [preselectedCustomerForOrder, setPreselectedCustomerForOrder] = useState<Customer | undefined>();
  const [isTransferStockOpen, setIsTransferStockOpen] = useState<boolean>(false);
  const [preselectedTransferItem, setPreselectedTransferItem] = useState<InventoryItem | undefined>();
  const [isRestockOpen, setIsRestockOpen] = useState<boolean>(false);
  const [preselectedRestockItem, setPreselectedRestockItem] = useState<InventoryItem | undefined>();
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; title: string; timeAgo: string; icon: string }>>([
    { id: 'log-1', title: 'System Initialized', timeAgo: 'Just now', icon: 'check_circle' },
    { id: 'log-2', title: 'Connected 3PL Telematics', timeAgo: '2m ago', icon: 'local_shipping' },
    { id: 'log-3', title: 'WMS Facilities Sync (99.8%)', timeAgo: '5m ago', icon: 'sync' },
  ]);

  const addAuditLog = (title: string, icon: string = 'info') => {
    setAuditLogs(prev => [
      { id: `log-${Date.now()}`, title, timeAgo: 'Just now', icon },
      ...prev.slice(0, 15),
    ]);
  };

  // Toast notification
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('erp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('erp_theme', 'light');
    }
  }, [isDarkMode]);

  // Initial Data Load from backend
  const refreshAllData = useCallback(async () => {
    try {
      const [dash, ords, inv, whs, custs, anlys, usrs] = await Promise.all([
        apiService.getDashboardOverview(),
        apiService.getOrders(),
        apiService.getInventory(),
        apiService.getWarehouses(),
        apiService.getCustomers(),
        apiService.getAnalyticsOverview(),
        apiService.getUsers(),
      ]);

      setDashboardData(dash);
      setOrders(ords);
      setInventory(inv);
      setWarehouses(whs);
      setCustomers(custs);
      if (!selectedCustomer && custs.length > 0) {
        setSelectedCustomer(custs[0]);
      }
      setAnalyticsData(anlys);
      setUsersList(usrs);
    } catch (err) {
      console.error('Failed to load ERP backend state:', err);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Handle Role Change
  const handleRoleChange = (role: UserRole) => {
    const updatedUser = apiService.setCurrentRole(role);
    setCurrentUser(updatedUser);
    showToast(`Switched active persona to ${updatedUser.name} (${updatedUser.role})`, 'info');
    addAuditLog(`Persona switched to ${updatedUser.name} (${updatedUser.role})`, 'badge');
  };

  // 3PL Waybill tracker trigger
  const handleTrack3PL = (waybillNo: string) => {
    setActiveTrackingWaybill(waybillNo);
    setActiveView('logistics');
    showToast(`Loading live telematics for 3PL waybill: ${waybillNo}`, 'info');
    addAuditLog(`Tracking 3PL waybill ${waybillNo}`, 'location_on');
  };

  // 3PL Sync trigger
  const handleSync3PL = async () => {
    setIsSyncing3PL(true);
    try {
      const res = await apiService.sync3PLInventory(selectedWarehouseId);
      await refreshAllData();
      showToast(res.message, 'success');
      addAuditLog(`3PL Warehouse Sync: ${res.message}`, 'sync');
    } catch {
      showToast('3PL WMS synchronization completed with warnings', 'warning');
    } finally {
      setIsSyncing3PL(false);
    }
  };

  // Order actions
  const handleCreateOrder = async (orderPayload: Partial<Order>) => {
    try {
      const created = await apiService.createOrder(orderPayload);
      await refreshAllData();
      showToast(`Order ${created.id} created and inventory allocated!`, 'success');
      addAuditLog(`Created Order #${created.id} ($${created.totalAmount.toLocaleString()})`, 'add_shopping_cart');
    } catch {
      showToast('Failed to create order', 'warning');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updated = await apiService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      if (selectedOrderForDetails?.id === orderId) {
        setSelectedOrderForDetails(updated);
      }
      await refreshAllData();
      showToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
      addAuditLog(`Order #${orderId} marked as ${newStatus}`, 'update');
    } catch {
      showToast('Failed to update order status', 'warning');
    }
  };

  // Stock Transfer
  const handleTransferStock = async (payload: {
    sku: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
  }) => {
    try {
      const res = await apiService.transferStock(payload);
      await refreshAllData();
      showToast(res.message, 'success');
      addAuditLog(`Transferred ${payload.quantity}x ${payload.sku} to ${payload.toWarehouseId}`, 'swap_horiz');
    } catch {
      showToast('Stock transfer failed', 'warning');
    }
  };

  // Restock PO
  const handleRestock = async (payload: {
    sku: string;
    warehouseId: string;
    quantity: number;
    supplierPo?: string;
  }) => {
    try {
      const res = await apiService.requestRestock(payload);
      await refreshAllData();
      showToast(res.message, 'success');
      addAuditLog(`Restock PO placed: ${payload.quantity}x ${payload.sku}`, 'inventory_2');
    } catch {
      showToast('Restock purchase order failed', 'warning');
    }
  };

  // Dispatch 3PL
  const handleDispatch = async (payload: {
    orderId: string;
    warehouseId: string;
    carrier: string;
    serviceType: string;
    pickupDate: string;
  }) => {
    try {
      const res = await apiService.dispatchShipment(payload);
      await refreshAllData();
      showToast(`Dispatched: ${res.message}. Waybill: ${res.shipment.waybillNo}`, 'success');
      setActiveTrackingWaybill(res.shipment.waybillNo);
      addAuditLog(`Dispatched Order #${payload.orderId} via ${payload.carrier} (${res.shipment.waybillNo})`, 'local_shipping');
    } catch {
      showToast('Failed to dispatch 3PL consignment', 'warning');
    }
  };

  // Active Warehouse
  const currentWarehouse =
    warehouses.find(w => w.id === selectedWarehouseId) || warehouses[0] || {
      id: 'WH-NA-01',
      code: 'NA-01',
      name: 'North American Hub (NA-01)',
      region: 'North America',
      utilizationPct: 82,
      usedCapacityPallets: 18432,
      totalCapacityPallets: 22500,
      stockHealthPct: 94.2,
      criticalItemsCount: 24,
      incomingDeliveriesCount: 14,
      partner3PL: 'FedEx Freight',
    };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0B0E14] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Notification Toast */}
      {toastMessage && (
        <div
          id="toast-notification"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-[13px] font-semibold flex items-center gap-2.5 border animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
              : 'bg-gray-900 text-white border-gray-700 dark:bg-[#151921] dark:text-white dark:border-[#242933]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toastMessage.type === 'success'
              ? 'check_circle'
              : toastMessage.type === 'warning'
              ? 'warning'
              : 'info'}
          </span>
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-current opacity-70 hover:opacity-100"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Main App Layout */}
      <div className="flex flex-1 min-h-screen relative">
        {/* Left Side Navigation (Fixed on Desktop, Slide Drawer on Mobile) */}
        <SideNavBar
          activeView={activeView}
          onViewChange={view => {
            setActiveView(view);
            setIsMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          onOpenCreateOrder={() => {
            setPreselectedCustomerForOrder(undefined);
            setIsCreateOrderOpen(true);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Right Main Content Area (With left margin on md+ for desktop sidebar) */}
        <div className="flex-1 flex flex-col min-w-0 md:pl-60">
          {/* Top Bar */}
          <TopNavBar
            currentUser={currentUser}
            usersList={usersList}
            onRoleChange={handleRoleChange}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
            onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenSupport={() => setIsSupportOpen(true)}
            recentAuditLogs={auditLogs}
            onSearchSubmit={q => {
              const query = q.trim();
              if (!query) return;
              if (query.toUpperCase().startsWith('WB-')) {
                handleTrack3PL(query.toUpperCase());
              } else if (query.toUpperCase().startsWith('ORD-')) {
                const found = orders.find(o => o.id.toLowerCase() === query.toLowerCase());
                if (found) {
                  setSelectedOrderForDetails(found);
                } else {
                  setActiveView('orders');
                }
              } else {
                setActiveView('orders');
              }
            }}
          />

          {/* Page Body View Router */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* View 1: Executive Overview Dashboard */}
            {activeView === 'dashboard' && dashboardData && (
              <DashboardView
                overview={dashboardData}
                currentUser={currentUser}
                onSelectOrder={order => setSelectedOrderForDetails(order)}
                onTrack3PL={wb => handleTrack3PL(wb)}
                onNavigate={view => setActiveView(view)}
                onExportReport={() => {
                  exportAnalyticsToPdf(analyticsData || (dashboardData as any));
                  showToast('Executive PDF report downloaded', 'success');
                }}
                onExportCsv={() => {
                  exportOrdersToCsv(orders);
                  showToast('Executive dataset exported as CSV', 'success');
                }}
              />
            )}

            {/* View 2: Order Management Table */}
            {activeView === 'orders' && (
              <OrdersView
                orders={orders}
                currentUser={currentUser}
                onSelectOrderDetails={order => setSelectedOrderForDetails(order)}
                onOpenCreateOrder={() => {
                  setPreselectedCustomerForOrder(undefined);
                  setIsCreateOrderOpen(true);
                }}
                onUpdateOrderStatus={handleUpdateOrderStatus}
                onTrack3PL={wb => handleTrack3PL(wb)}
                onBulkUpdate={(ids, action, status) => {
                  if (status) {
                    ids.forEach(id => handleUpdateOrderStatus(id, status));
                    showToast(`Updated status for ${ids.length} orders to ${status}`, 'success');
                  } else {
                    showToast(`Performed ${action} on ${ids.length} orders`, 'info');
                  }
                }}
                onExportCsv={filtered => {
                  exportOrdersToCsv(filtered || orders);
                  showToast('Orders exported as CSV', 'success');
                }}
                onExportPdf={filtered => {
                  exportOrdersToPdf(filtered || orders);
                  showToast('Orders exported as PDF', 'success');
                }}
              />
            )}

            {/* View 3: Inventory Management */}
            {activeView === 'inventory' && (
              <InventoryView
                items={inventory}
                warehouse={currentWarehouse}
                warehouses={warehouses}
                currentUser={currentUser}
                onSelectWarehouse={id => setSelectedWarehouseId(id)}
                onOpenTransferModal={item => {
                  setPreselectedTransferItem(item);
                  setIsTransferStockOpen(true);
                }}
                onOpenRestockModal={item => {
                  setPreselectedRestockItem(item);
                  setIsRestockOpen(true);
                }}
                onSync3PL={handleSync3PL}
                isSyncing3PL={isSyncing3PL}
                onExportCsv={() => {
                  exportInventoryToCsv(inventory, currentWarehouse.name);
                  showToast('Inventory report exported as CSV', 'success');
                }}
              />
            )}

            {/* View 4: Customer 360 View */}
            {activeView === 'customers' && (
              <CustomersView
                customers={customers}
                selectedCustomer={selectedCustomer || customers[0]}
                onSelectCustomer={c => setSelectedCustomer(c)}
                orders={orders}
                onSelectOrderDetails={o => setSelectedOrderForDetails(o)}
                onTrack3PL={wb => handleTrack3PL(wb)}
                onOpenCreateOrderForCustomer={c => {
                  setPreselectedCustomerForOrder(c);
                  setIsCreateOrderOpen(true);
                }}
              />
            )}

            {/* View 5: Analytics & Reporting */}
            {activeView === 'analytics' && analyticsData && (
              <AnalyticsView
                analytics={analyticsData}
                onExportPdf={() => {
                  exportAnalyticsToPdf(analyticsData);
                  showToast('Analytics summary downloaded as PDF', 'success');
                }}
                onExportCsv={() => {
                  exportAnalyticsToCsv(analyticsData);
                  showToast('Analytics summary downloaded as CSV', 'success');
                }}
              />
            )}

            {/* View 6: 3PL Live Logistics & Telematics */}
            {activeView === 'logistics' && (
              <Logistics3PLView
                initialWaybillNo={activeTrackingWaybill}
                orders={orders}
                onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <CreateOrderModal
        isOpen={isCreateOrderOpen}
        onClose={() => setIsCreateOrderOpen(false)}
        customers={customers}
        inventory={inventory}
        warehouses={warehouses}
        currentUser={currentUser}
        preselectedCustomer={preselectedCustomerForOrder}
        onSubmit={handleCreateOrder}
      />

      <TransferStockModal
        isOpen={isTransferStockOpen}
        onClose={() => setIsTransferStockOpen(false)}
        inventory={inventory}
        warehouses={warehouses}
        preselectedItem={preselectedTransferItem}
        onSubmit={handleTransferStock}
      />

      <RestockModal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        inventory={inventory}
        warehouses={warehouses}
        preselectedItem={preselectedRestockItem}
        onSubmit={handleRestock}
      />

      <OrderDetailsModal
        order={selectedOrderForDetails}
        isOpen={Boolean(selectedOrderForDetails)}
        onClose={() => setSelectedOrderForDetails(null)}
        currentUser={currentUser}
        onUpdateStatus={handleUpdateOrderStatus}
        onTrack3PL={handleTrack3PL}
        onPrintInvoice={o => {
          exportOrderInvoiceSlip(o);
          showToast(`Consignment slip for ${o.id} downloaded`, 'success');
        }}
      />

      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        orders={orders}
        warehouses={warehouses}
        onSubmit={handleDispatch}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSavePreferences={() => {
          showToast('ERP global preferences updated', 'success');
        }}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </div>
  );
}
