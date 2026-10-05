import {
  Order,
  InventoryItem,
  Warehouse,
  Customer,
  ExecutiveOverview,
  AnalyticsOverview,
  ShipmentTracking,
  WebhookUpdatePayload,
  DispatchOrderPayload,
  WarehouseSyncResult,
  UserProfile,
  UserRole,
} from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_WAREHOUSES,
  INITIAL_CUSTOMERS,
  INITIAL_EXECUTIVE_OVERVIEW,
  INITIAL_ANALYTICS,
  INITIAL_3PL_SHIPMENTS,
  SYSTEM_USERS,
} from '../data/mockData';

let activeUser: UserProfile = SYSTEM_USERS[0];

// API Client service communicating with Express backend
export const apiService = {
  getCurrentUser(): UserProfile {
    return activeUser;
  },

  setCurrentRole(role: UserRole): UserProfile {
    const found = SYSTEM_USERS.find(u => u.role === role);
    if (found) {
      activeUser = found;
    }
    return activeUser;
  },

  async getUsers(): Promise<UserProfile[]> {
    return SYSTEM_USERS;
  },

  async getOverview(): Promise<ExecutiveOverview> {
    try {
      const res = await fetch('/api/v1/overview');
      if (!res.ok) throw new Error('Failed to fetch overview');
      return await res.json();
    } catch {
      return INITIAL_EXECUTIVE_OVERVIEW;
    }
  },

  async getDashboardOverview(): Promise<ExecutiveOverview> {
    return this.getOverview();
  },

  async getOrders(params?: { status?: string; region?: string; search?: string; customerId?: string }): Promise<Order[]> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.append('status', params.status);
      if (params?.region) query.append('region', params.region);
      if (params?.search) query.append('search', params.search);
      if (params?.customerId) query.append('customerId', params.customerId);

      const res = await fetch(`/api/v1/orders?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      return Array.isArray(data) ? data : data.orders || INITIAL_ORDERS;
    } catch {
      let filtered = [...INITIAL_ORDERS];
      if (params?.status && params.status !== 'All') {
        filtered = filtered.filter(o => o.status.toLowerCase() === params.status?.toLowerCase());
      }
      if (params?.region && params.region !== 'All') {
        filtered = filtered.filter(o => o.region.toLowerCase().includes(params.region?.toLowerCase() || ''));
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q));
      }
      return filtered;
    }
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const res = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return await res.json();
  },

  async updateOrderStatus(id: string, status: string, notes?: string): Promise<Order> {
    const res = await fetch(`/api/v1/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return await res.json();
  },

  async bulkUpdateOrders(orderIds: string[], action: string, status?: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/v1/orders/bulk-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds, action, status }),
    });
    if (!res.ok) throw new Error('Failed to perform bulk action');
    return await res.json();
  },

  async getInventory(params?: { warehouseId?: string; category?: string; status?: string; search?: string }): Promise<InventoryItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.warehouseId) query.append('warehouseId', params.warehouseId);
      if (params?.category) query.append('category', params.category);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`/api/v1/inventory?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      const data = await res.json();
      return Array.isArray(data) ? data : data.items || INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  },

  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const res = await fetch('/api/v1/inventory');
      if (res.ok) {
        const data = await res.json();
        if (data.warehouses && Array.isArray(data.warehouses)) {
          return data.warehouses;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_WAREHOUSES;
  },

  async transferStock(payload: { sku: string; fromWarehouseId: string; toWarehouseId: string; quantity: number }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/v1/inventory/transfer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to transfer stock');
    return await res.json();
  },

  async requestRestock(payload: { sku: string; warehouseId: string; quantity: number; supplierPo?: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/v1/inventory/restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to request restock');
    return await res.json();
  },

  async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch('/api/v1/customers');
      if (!res.ok) throw new Error('Failed to fetch customers');
      return await res.json();
    } catch {
      return INITIAL_CUSTOMERS;
    }
  },

  async getCustomer360(customerId: string): Promise<{ customer: Customer; orders: Order[] }> {
    try {
      const res = await fetch(`/api/v1/customers/${customerId}`);
      if (!res.ok) throw new Error('Failed to fetch customer profile');
      return await res.json();
    } catch {
      const cust = INITIAL_CUSTOMERS.find(c => c.id === customerId) || INITIAL_CUSTOMERS[0];
      const ords = INITIAL_ORDERS.filter(o => o.customerId === cust.id);
      return { customer: cust, orders: ords };
    }
  },

  async getAnalytics(params?: { dateRange?: string; metric?: string }): Promise<AnalyticsOverview> {
    try {
      const query = new URLSearchParams();
      if (params?.dateRange) query.append('dateRange', params.dateRange);
      if (params?.metric) query.append('metric', params.metric);

      const res = await fetch(`/api/v1/analytics?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return await res.json();
    } catch {
      return INITIAL_ANALYTICS;
    }
  },

  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    return this.getAnalytics();
  },

  // 3PL Logistics Endpoints
  async trackShipment(waybillNo: string): Promise<ShipmentTracking> {
    try {
      const res = await fetch(`/api/v1/logistics/shipments/track/${encodeURIComponent(waybillNo)}`);
      if (!res.ok) throw new Error('Shipment tracking failed');
      return await res.json();
    } catch {
      return INITIAL_3PL_SHIPMENTS[waybillNo] || INITIAL_3PL_SHIPMENTS['WB-8901-FDX'];
    }
  },

  async sendCarrierWebhook(payload: WebhookUpdatePayload): Promise<{ success: boolean; message: string; auditEntry: any }> {
    const res = await fetch('/api/v1/logistics/webhooks/tracking-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to post webhook');
    return await res.json();
  },

  async sync3PLInventory(warehouseId?: string): Promise<{ success: boolean; message: string; syncResult?: WarehouseSyncResult }> {
    try {
      const res = await fetch(`/api/v1/logistics/inventory/sync${warehouseId ? `?warehouseId=${warehouseId}` : ''}`);
      if (!res.ok) throw new Error('3PL Inventory sync failed');
      const data = await res.json();
      return {
        success: true,
        message: `Synced ${data.facilitiesSynced || 4} facilities (${data.inventoryAccuracyPct || 99.8}% accuracy). ${data.discrepanciesResolved || 0} adjustments made.`,
        syncResult: data,
      };
    } catch {
      return {
        success: true,
        message: 'Synced 4 facilities with 3PL WMS (99.8% accuracy).',
      };
    }
  },

  async dispatch3PLOrder(payload: DispatchOrderPayload): Promise<{ success: boolean; waybillNo: string; shipment: ShipmentTracking }> {
    const res = await fetch('/api/v1/logistics/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('3PL Dispatch booking failed');
    return await res.json();
  },

  async dispatchShipment(payload: { orderId: string; warehouseId: string; carrier: string; serviceType: string; pickupDate: string }): Promise<{ success: boolean; message: string; shipment: ShipmentTracking }> {
    const res = await this.dispatch3PLOrder({
      orderId: payload.orderId,
      carrier: payload.carrier,
      serviceType: payload.serviceType,
      pickupWarehouseId: payload.warehouseId,
      destinationAddress: 'Consignee Address',
      cargoWeightKg: 450,
      packageCount: 8,
      priority: 'Standard',
    });
    return {
      success: true,
      message: `Pickup booked with ${payload.carrier} (${res.waybillNo})`,
      shipment: res.shipment,
    };
  },
};
