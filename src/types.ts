export type ViewType = 'dashboard' | 'orders' | 'inventory' | 'customers' | 'analytics' | 'logistics' | 'settings';

export type UserRole = 
  | 'admin' 
  | 'sales_manager' 
  | 'warehouse_supervisor' 
  | 'financial_analyst';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatarUrl: string;
  department: string;
  permissions: {
    canCreateOrders: boolean;
    canEditOrders: boolean;
    canTransferStock: boolean;
    canRequestRestock: boolean;
    canDispatch3PL: boolean;
    canViewFinancials: boolean;
    canManageWebhooks: boolean;
    canExportReports: boolean;
  };
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'On Hold' | 'Disputed' | 'Cancelled';
export type Region = 'North America' | 'Europe' | 'Asia Pacific' | 'Latin America' | 'Middle East';

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weightKg: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerInitials: string;
  customerAvatarBg?: string;
  date: string;
  status: OrderStatus;
  totalAmount: number;
  region: Region;
  shippingAddress: string;
  warehouseId: string;
  items: OrderItem[];
  itemSummary: string; // e.g. "14 Pallets"
  waybillNo?: string;
  carrier?: string;
  paymentTerms?: string;
  notes?: string;
}

export type StockStatus = 'Low Stock' | 'Optimal' | 'Critical' | 'Overstock';
export type InventoryStatus = StockStatus;

export interface InventoryItem {
  sku: string;
  name: string;
  category: 'Electronics' | 'Components' | 'Hardware' | 'Packaging' | 'Industrial' | 'Raw Materials';
  warehouseId: string;
  warehouseName: string;
  inStock: number;
  committed: number;
  incoming: number;
  reorderPoint: number;
  unitCost: number;
  status: StockStatus;
  lastSyncDate: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  region: Region;
  totalCapacityPallets: number;
  usedCapacityPallets: number;
  utilizationPct: number;
  stockHealthPct: number;
  criticalItemsCount: number;
  incomingDeliveriesCount: number;
  partner3PL: string;
}

export interface CustomerDispute {
  id: string;
  orderId: string;
  date: string;
  amount: number;
  reason: string;
  status: 'Open' | 'Under Investigation' | 'Resolved';
  assignedTo: string;
}

export interface CategoryAffinity {
  category: string;
  percentage: number;
  color: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  initials: string;
  tier: 'Enterprise Tier' | 'Corporate' | 'Standard Wholesale' | 'Preferred Partner';
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    title: string;
  };
  accountStatus: 'Active & Good Standing' | 'Credit Review Required' | 'Restricted';
  headquarters: {
    city: string;
    state: string;
    country: string;
    coordinates: { lat: number; lng: number };
    mapQuery: string;
  };
  financials: {
    creditLimit: number;
    creditUtilized: number;
    creditUtilizedPct: number;
    paymentTerms: string;
    avgDaysToPay: number;
    ytdRevenue: number;
    openOrdersCount: number;
    openOrdersValue: number;
    activeDisputesCount: number;
  };
  productAffinities: CategoryAffinity[];
  disputes: CustomerDispute[];
}

export interface ActivityItem {
  id: string;
  type: 'delivery' | 'alert' | 'customer' | 'report' | 'dispatch';
  title: string;
  description: string;
  timeAgo: string;
  timestamp: string;
  badgeColor: string;
  icon: string;
}

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  unitsSold: number;
  revenue: number;
  trend: 'up' | 'flat' | 'down';
  icon: string;
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number; // in Millions or absolute
  orders: number;
  projected?: boolean;
}

export interface VolumeByRegion {
  region: Region;
  percentage: number;
  color: string;
  activeShipments: number;
  status: 'optimal' | 'warning' | 'normal';
}

export interface ExecutiveOverview {
  totalRevenue: number;
  revenueGrowthPct: number;
  totalOrders: number;
  ordersGrowthPct: number;
  activeShipments: number;
  delayedShipments: number;
  customerSatisfaction: number;
  csatChange: number;
  revenueTrends: RevenueTrendPoint[];
  volumeByRegion: VolumeByRegion[];
  recentActivities: ActivityItem[];
  topProducts: TopProduct[];
}

export type DashboardOverview = ExecutiveOverview;

export interface ShipmentWaypoint {
  timestamp: string;
  location: string;
  event: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface ShipmentTracking {
  waybillNo: string;
  orderId: string;
  carrier: 'FedEx Freight' | 'DHL Global Forwarding' | 'Maersk Logistics' | 'BlueDart Express' | 'DB Schenker';
  serviceType: 'Priority Freight' | 'Standard LTL' | 'Air Expedited' | 'Ocean Intermodal';
  origin: {
    facility: string;
    city: string;
    country: string;
    coords: { lat: number; lng: number };
  };
  destination: {
    customer: string;
    city: string;
    country: string;
    coords: { lat: number; lng: number };
  };
  currentLocation: {
    city: string;
    state: string;
    lat: number;
    lng: number;
  };
  status: 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CUSTOMS_HOLD' | 'WEATHER_DELAY';
  progressPct: number;
  estimatedDelivery: string;
  actualSpeedKmH: number;
  cargoTempCelsius: number;
  tempStatus: 'Normal' | 'Alert';
  fuelLevelPct: number;
  driverName: string;
  driverPhone: string;
  licensePlate: string;
  waypoints: ShipmentWaypoint[];
  lastUpdated: string;
}

export interface WebhookUpdatePayload {
  waybillNo: string;
  carrier: string;
  checkpoint: string;
  status: 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CUSTOMS_HOLD' | 'WEATHER_DELAY';
  timestamp: string;
  remarks: string;
  coordinates?: { lat: number; lng: number };
}

export interface DispatchOrderPayload {
  orderId: string;
  carrier: string;
  serviceType: string;
  pickupWarehouseId: string;
  destinationAddress: string;
  cargoWeightKg: number;
  packageCount: number;
  specialInstructions?: string;
  priority: 'Standard' | 'Urgent' | 'Cold-Chain Sensitive';
}

export interface WarehouseSyncResult {
  syncId: string;
  timestamp: string;
  facilitiesSynced: number;
  discrepanciesResolved: number;
  inventoryAccuracyPct: number;
  syncedWarehouses: {
    warehouseId: string;
    warehouseName: string;
    itemsCount: number;
    status: 'Synced' | 'Adjusted';
  }[];
}

export interface RegionalHeatmapRow {
  region: Region;
  categories: {
    category: string;
    rating: 'High' | 'Med-High' | 'Med' | 'Med-Low' | 'Low';
    value: number; // Volume count, or Revenue $, or Margin %
    displayLabel: string;
    opacityClass: string;
  }[];
}

export interface SalesForecastPoint {
  month: string;
  actualAmount?: number;
  projectedAmount?: number;
  label: string;
}

export interface FulfillmentAccuracyData {
  onTimeInFullPct: number;
  delayedPct: number;
  errorsPct: number;
}

export interface AnalyticsOverview {
  kpis: {
    totalRevenue: number;
    revenueGrowthPct: number;
    activeOrders: number;
    ordersGrowthPct: number;
    avgFulfillmentDays: number;
    fulfillmentChangePct: number;
    customerSatisfactionPct: number;
    csatChangePct: number;
  };
  salesForecasting: SalesForecastPoint[];
  fulfillmentAccuracy: FulfillmentAccuracyData;
  regionalHeatmap: {
    metric: 'Volume' | 'Revenue' | 'Margin';
    rows: RegionalHeatmapRow[];
  };
}
