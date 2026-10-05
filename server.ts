import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_WAREHOUSES,
  INITIAL_CUSTOMERS,
  INITIAL_EXECUTIVE_OVERVIEW,
  INITIAL_ANALYTICS,
  INITIAL_3PL_SHIPMENTS,
} from './src/data/mockData';
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
} from './src/types';

// In-memory persistent state for the ERP backend
let orders: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));
let inventory: InventoryItem[] = JSON.parse(JSON.stringify(INITIAL_INVENTORY));
let warehouses: Warehouse[] = JSON.parse(JSON.stringify(INITIAL_WAREHOUSES));
let customers: Customer[] = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
let executiveOverview: ExecutiveOverview = JSON.parse(JSON.stringify(INITIAL_EXECUTIVE_OVERVIEW));
let analytics: AnalyticsOverview = JSON.parse(JSON.stringify(INITIAL_ANALYTICS));
let shipments: Record<string, ShipmentTracking> = JSON.parse(JSON.stringify(INITIAL_3PL_SHIPMENTS));
let webhookAuditLogs: Array<{ id: string; timestamp: string; carrier: string; waybillNo: string; status: string; remarks: string }> = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
  });

  // 1. Executive Overview
  app.get('/api/v1/overview', (req: Request, res: Response) => {
    // Dynamic calculation of active shipments and orders count
    const totalRev = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
    const activeShipmentsCount = orders.filter(o => o.status === 'Shipped' || o.status === 'Processing').length;
    const delayedCount = orders.filter(o => o.status === 'On Hold' || o.status === 'Disputed').length;

    const response: ExecutiveOverview = {
      ...executiveOverview,
      totalOrders: orders.length + 14285,
      totalRevenue: totalRev > 2000000 ? totalRev : 2400000,
      activeShipments: activeShipmentsCount + 838,
      delayedShipments: delayedCount + 10,
    };
    res.json(response);
  });

  // 2. Orders Endpoints
  app.get('/api/v1/orders', (req: Request, res: Response) => {
    const { status, region, search, customerId } = req.query;
    let filtered = [...orders];

    if (status && status !== 'All') {
      filtered = filtered.filter(o => o.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (region && region !== 'All') {
      filtered = filtered.filter(o => o.region.toLowerCase().includes((region as string).toLowerCase()));
    }
    if (customerId) {
      filtered = filtered.filter(o => o.customerId === customerId);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        o =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          (o.waybillNo && o.waybillNo.toLowerCase().includes(q))
      );
    }

    res.json({
      orders: filtered,
      totalCount: filtered.length,
      overallTotal: 1204,
    });
  });

  app.post('/api/v1/orders', (req: Request, res: Response) => {
    const body = req.body;
    const nextNum = Math.floor(8910 + Math.random() * 100);
    const newOrderId = body.id || `ORD-2023-${nextNum}`;

    const newOrder: Order = {
      id: newOrderId,
      customerId: body.customerId || 'CUST-89234',
      customerName: body.customerName || 'Acme Corp Logistics',
      customerInitials: (body.customerName || 'Acme Corp Logistics').substring(0, 2).toUpperCase(),
      customerAvatarBg: 'bg-[#131b2e] text-[#7c839b]',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: body.status || 'Processing',
      totalAmount: Number(body.totalAmount) || 12450.00,
      region: body.region || 'North America',
      shippingAddress: body.shippingAddress || '220 N Wacker Dr, Chicago, IL 60606',
      warehouseId: body.warehouseId || 'WH-NA-01',
      items: body.items || [
        { id: 'ITM-NEW-1', sku: 'EL-8890-A', name: 'Industrial Sensor Array V2', quantity: 5, unitPrice: 850, totalPrice: 4250, weightKg: 60 }
      ],
      itemSummary: body.itemSummary || `${body.items?.length || 1} Pallet(s)`,
      waybillNo: body.waybillNo || `WB-${nextNum}-FDX`,
      carrier: body.carrier || 'FedEx Freight',
      paymentTerms: body.paymentTerms || 'Net 30',
      notes: body.notes || 'Created via Logistics ERP Order Hub',
    };

    orders.unshift(newOrder);

    // Update customer open orders
    const cust = customers.find(c => c.id === newOrder.customerId);
    if (cust) {
      cust.financials.openOrdersCount += 1;
      cust.financials.openOrdersValue += newOrder.totalAmount;
    }

    // Add activity
    executiveOverview.recentActivities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'dispatch',
      title: `Order #${newOrder.id} Placed`,
      description: `${newOrder.customerName} - $${newOrder.totalAmount.toLocaleString()}`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      badgeColor: 'bg-blue-100 text-blue-600',
      icon: 'add_shopping_cart',
    });

    res.status(201).json(newOrder);
  });

  app.patch('/api/v1/orders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, notes, carrier, waybillNo } = req.body;
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status) orders[orderIndex].status = status;
    if (notes !== undefined) orders[orderIndex].notes = notes;
    if (carrier) orders[orderIndex].carrier = carrier;
    if (waybillNo) orders[orderIndex].waybillNo = waybillNo;

    res.json(orders[orderIndex]);
  });

  app.post('/api/v1/orders/bulk-action', (req: Request, res: Response) => {
    const { orderIds, action, status } = req.body;
    if (!Array.isArray(orderIds)) {
      return res.status(400).json({ error: 'orderIds array required' });
    }

    if (action === 'update_status' && status) {
      orders = orders.map(o => (orderIds.includes(o.id) ? { ...o, status } : o));
    } else if (action === 'delete') {
      orders = orders.filter(o => !orderIds.includes(o.id));
    }

    res.json({ success: true, updatedCount: orderIds.length });
  });

  // 3. Inventory Endpoints
  app.get('/api/v1/inventory', (req: Request, res: Response) => {
    const { warehouseId, category, status, search } = req.query;
    let filtered = [...inventory];

    if (warehouseId && warehouseId !== 'All') {
      filtered = filtered.filter(i => i.warehouseId === warehouseId);
    }
    if (category && category !== 'All Categories') {
      filtered = filtered.filter(i => i.category.toLowerCase() === (category as string).toLowerCase());
    }
    if (status && status !== 'All') {
      filtered = filtered.filter(i => i.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q));
    }

    const selectedWarehouse = warehouses.find(w => w.id === warehouseId) || warehouses[0];

    res.json({
      items: filtered,
      totalCount: filtered.length,
      warehouse: selectedWarehouse,
      warehouses: warehouses,
    });
  });

  app.post('/api/v1/inventory/transfer', (req: Request, res: Response) => {
    const { sku, fromWarehouseId, toWarehouseId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    let sourceItem = inventory.find(i => i.sku === sku && i.warehouseId === fromWarehouseId);
    if (!sourceItem) {
      // Find item in any warehouse to clone info
      const templateItem = inventory.find(i => i.sku === sku);
      if (!templateItem) return res.status(404).json({ error: 'SKU not found' });
      sourceItem = templateItem;
    }

    sourceItem.inStock = Math.max(0, sourceItem.inStock - qty);
    if (sourceItem.inStock <= sourceItem.reorderPoint / 2) {
      sourceItem.status = 'Critical';
    } else if (sourceItem.inStock <= sourceItem.reorderPoint) {
      sourceItem.status = 'Low Stock';
    }

    // Add to dest warehouse
    let destItem = inventory.find(i => i.sku === sku && i.warehouseId === toWarehouseId);
    const destWh = warehouses.find(w => w.id === toWarehouseId);
    if (!destItem) {
      destItem = {
        ...sourceItem,
        warehouseId: toWarehouseId,
        warehouseName: destWh?.name || 'Destination Warehouse',
        inStock: qty,
        committed: 0,
        incoming: 0,
        status: 'Optimal',
        lastSyncDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      };
      inventory.push(destItem);
    } else {
      destItem.inStock += qty;
      destItem.status = 'Optimal';
    }

    executiveOverview.recentActivities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'alert',
      title: `Stock Transfer Completed`,
      description: `${qty} units of ${sku} moved from ${fromWarehouseId} to ${toWarehouseId}`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      badgeColor: 'bg-blue-100 text-blue-600',
      icon: 'swap_horiz',
    });

    res.json({ success: true, message: 'Transfer completed successfully', sourceItem, destItem });
  });

  app.post('/api/v1/inventory/restock', (req: Request, res: Response) => {
    const { sku, warehouseId, quantity, supplierPo } = req.body;
    const qty = Number(quantity) || 50;

    let targetItem = inventory.find(i => i.sku === sku && i.warehouseId === warehouseId);
    if (!targetItem) {
      targetItem = inventory.find(i => i.sku === sku);
    }

    if (targetItem) {
      targetItem.incoming += qty;
      targetItem.lastSyncDate = new Date().toISOString().replace('T', ' ').substring(0, 16);
    }

    executiveOverview.recentActivities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'alert',
      title: `Restock Order Placed (${supplierPo || 'PO-2026-AUTO'})`,
      description: `Requested +${qty} units of ${sku}. Expected within 48-72 hrs.`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      badgeColor: 'bg-emerald-100 text-emerald-600',
      icon: 'add_shopping_cart',
    });

    res.json({ success: true, message: 'Restock order submitted', targetItem });
  });

  // 4. Customer 360 Endpoints
  app.get('/api/v1/customers', (req: Request, res: Response) => {
    res.json(customers);
  });

  app.get('/api/v1/customers/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const customer = customers.find(c => c.id === id) || customers[0];
    const customerOrders = orders.filter(o => o.customerId === customer.id);

    res.json({
      customer,
      orders: customerOrders,
    });
  });

  // 5. Analytics Endpoints
  app.get('/api/v1/analytics', (req: Request, res: Response) => {
    const { dateRange, metric } = req.query;
    // Calculate live analytics
    const selectedMetric = (metric as 'Volume' | 'Revenue' | 'Margin') || 'Volume';
    const response: AnalyticsOverview = {
      ...analytics,
      regionalHeatmap: {
        ...analytics.regionalHeatmap,
        metric: selectedMetric,
      },
    };
    res.json(response);
  });

  // 6. 3PL Logistics Partner Integration API Endpoints (Explicitly Required)
  
  // `GET /api/v1/logistics/shipments/track/:waybillNo` (Live shipment tracking)
  app.get('/api/v1/logistics/shipments/track/:waybillNo', (req: Request, res: Response) => {
    const { waybillNo } = req.params;
    let shipment = shipments[waybillNo];

    if (!shipment) {
      // Find matching order
      const matchingOrder = orders.find(o => o.waybillNo === waybillNo || o.id === waybillNo);
      if (matchingOrder) {
        shipment = {
          waybillNo: matchingOrder.waybillNo || `WB-${matchingOrder.id}-FDX`,
          orderId: matchingOrder.id,
          carrier: (matchingOrder.carrier as any) || 'FedEx Freight',
          serviceType: 'Priority Freight',
          origin: {
            facility: 'North American Logistics Hub NA-01',
            city: 'Columbus',
            country: 'USA',
            coords: { lat: 39.9612, lng: -82.9988 },
          },
          destination: {
            customer: matchingOrder.customerName,
            city: matchingOrder.shippingAddress.split(',')[1]?.trim() || 'Chicago',
            country: 'USA',
            coords: { lat: 41.8781, lng: -87.6298 },
          },
          currentLocation: {
            city: 'Highway Interchange 80/94',
            state: 'IL',
            lat: 41.5833,
            lng: -87.5000,
          },
          status: matchingOrder.status === 'Delivered' ? 'DELIVERED' : matchingOrder.status === 'On Hold' ? 'CUSTOMS_HOLD' : 'IN_TRANSIT',
          progressPct: matchingOrder.status === 'Delivered' ? 100 : 75,
          estimatedDelivery: 'Today, 18:00 Local Time',
          actualSpeedKmH: matchingOrder.status === 'Delivered' ? 0 : 82,
          cargoTempCelsius: 5.1,
          tempStatus: 'Normal',
          fuelLevelPct: 74,
          driverName: 'John Davis',
          driverPhone: '+1 (312) 555-0144',
          licensePlate: 'US-TRK-7712',
          waypoints: [
            { timestamp: 'Today 07:00', location: 'Warehouse Facility', event: 'Pickup and load check complete', status: 'COMPLETED' },
            { timestamp: 'Today 11:30', location: 'Regional Gateway', event: 'Transshipment scan', status: 'COMPLETED' },
            { timestamp: 'Today 15:45', location: 'Metropolitan Perimeter', event: 'Approaching delivery destination', status: 'IN_PROGRESS' },
          ],
          lastUpdated: 'Live GPS Telematics Active',
        };
        shipments[waybillNo] = shipment;
      } else {
        // Return active default shipment
        shipment = shipments['WB-8901-FDX'];
      }
    }

    res.json(shipment);
  });

  // `POST /api/v1/logistics/webhooks/tracking-update` (Carrier status push updates)
  app.post('/api/v1/logistics/webhooks/tracking-update', (req: Request, res: Response) => {
    const payload: WebhookUpdatePayload = req.body;
    const { waybillNo, carrier, checkpoint, status, remarks, coordinates } = payload;

    if (!waybillNo) {
      return res.status(400).json({ error: 'waybillNo is required in webhook payload' });
    }

    const auditEntry = {
      id: `WHK-${Date.now()}`,
      timestamp: new Date().toISOString(),
      carrier: carrier || 'Carrier Partner',
      waybillNo,
      status: status || 'IN_TRANSIT',
      remarks: remarks || 'Status update received from carrier telematic hub',
    };
    webhookAuditLogs.unshift(auditEntry);

    // Update shipment if exists
    if (shipments[waybillNo]) {
      shipments[waybillNo].status = status || shipments[waybillNo].status;
      if (checkpoint) {
        shipments[waybillNo].waypoints.push({
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: checkpoint,
          event: remarks || 'Carrier checkpoint milestone reached',
          status: status === 'DELIVERED' ? 'COMPLETED' : 'IN_PROGRESS',
        });
      }
      if (coordinates) {
        shipments[waybillNo].currentLocation.lat = coordinates.lat;
        shipments[waybillNo].currentLocation.lng = coordinates.lng;
      }
      if (status === 'DELIVERED') {
        shipments[waybillNo].progressPct = 100;
        shipments[waybillNo].actualSpeedKmH = 0;
      }
    }

    // Sync with corresponding order
    const relatedOrder = orders.find(o => o.waybillNo === waybillNo);
    if (relatedOrder) {
      if (status === 'DELIVERED') relatedOrder.status = 'Delivered';
      else if (status === 'IN_TRANSIT' || status === 'OUT_FOR_DELIVERY') relatedOrder.status = 'Shipped';
      else if (status === 'CUSTOMS_HOLD' || status === 'WEATHER_DELAY') relatedOrder.status = 'On Hold';
    }

    // Add activity entry
    executiveOverview.recentActivities.unshift({
      id: `ACT-${Date.now()}`,
      type: status === 'DELIVERED' ? 'delivery' : 'alert',
      title: `3PL Telematics Ping: ${waybillNo}`,
      description: `${carrier || 'Carrier'}: ${remarks || checkpoint || status}`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      badgeColor: status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600',
      icon: status === 'DELIVERED' ? 'check_circle' : 'local_shipping',
    });

    res.status(200).json({
      success: true,
      message: '3PL carrier webhook processed and synchronized successfully',
      auditEntry,
      updatedShipment: shipments[waybillNo] || null,
    });
  });

  // `GET /api/v1/logistics/inventory/sync` (3PL warehouse stock level sync)
  app.get('/api/v1/logistics/inventory/sync', (req: Request, res: Response) => {
    // Perform simulated real-time synchronization with external partner WMS (FedEx, DHL, Maersk)
    const timestamp = new Date().toISOString();
    const syncedWarehouses = warehouses.map(w => {
      // Simulate minor stock reconciliation
      const count = inventory.filter(i => i.warehouseId === w.id).length;
      return {
        warehouseId: w.id,
        warehouseName: w.name,
        itemsCount: count,
        partner: w.partner3PL,
        latencyMs: Math.floor(45 + Math.random() * 80),
        status: 'Synced' as const,
      };
    });

    // Update last sync dates on items
    inventory = inventory.map(item => ({
      ...item,
      lastSyncDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
    }));

    executiveOverview.recentActivities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'report',
      title: '3PL Partner WMS Sync Complete',
      description: `Reconciled stock counts across 4 partner distribution hubs.`,
      timeAgo: 'Just now',
      timestamp,
      badgeColor: 'bg-emerald-100 text-emerald-600',
      icon: 'sync',
    });

    res.json({
      syncId: `SYNC-${Date.now()}`,
      timestamp,
      facilitiesSynced: warehouses.length,
      discrepanciesResolved: 0,
      inventoryAccuracyPct: 99.8,
      syncedWarehouses,
    });
  });

  // `POST /api/v1/logistics/dispatch` (Create pickup & order dispatch)
  app.post('/api/v1/logistics/dispatch', (req: Request, res: Response) => {
    const payload: DispatchOrderPayload = req.body;
    const { orderId, carrier, serviceType, pickupWarehouseId, destinationAddress, cargoWeightKg, packageCount, specialInstructions } = payload;

    const order = orders.find(o => o.id === orderId);
    const waybillNo = `WB-${orderId ? orderId.replace('ORD-', '') : Math.floor(1000 + Math.random() * 9000)}-${(carrier || 'FDX').substring(0, 3).toUpperCase()}`;

    if (order) {
      order.status = 'Shipped';
      order.waybillNo = waybillNo;
      order.carrier = carrier || 'FedEx Freight';
    }

    const newShipment: ShipmentTracking = {
      waybillNo,
      orderId: orderId || 'ORD-GEN-900',
      carrier: (carrier as any) || 'FedEx Freight',
      serviceType: (serviceType as any) || 'Priority Freight',
      origin: {
        facility: pickupWarehouseId || 'North American Hub (NA-01)',
        city: 'Columbus',
        country: 'USA',
        coords: { lat: 39.9612, lng: -82.9988 },
      },
      destination: {
        customer: order?.customerName || 'Client Consignee',
        city: destinationAddress?.split(',')[1]?.trim() || 'Chicago',
        country: 'USA',
        coords: { lat: 41.8781, lng: -87.6298 },
      },
      currentLocation: {
        city: 'Origin Dock Waiting Area',
        state: 'OH',
        lat: 39.9612,
        lng: -82.9988,
      },
      status: 'IN_TRANSIT',
      progressPct: 10,
      estimatedDelivery: 'Within 24-48 Hours',
      actualSpeedKmH: 0,
      cargoTempCelsius: 4.5,
      tempStatus: 'Normal',
      fuelLevelPct: 95,
      driverName: 'Assigned Courier Driver',
      driverPhone: '+1 (800) 555-3737',
      licensePlate: 'DISPATCH-READY',
      waypoints: [
        {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: pickupWarehouseId || 'Distribution Hub Dock',
          event: `Dispatch scheduled for ${packageCount || 1} item(s) (${cargoWeightKg || 100} kg)`,
          status: 'COMPLETED',
          notes: specialInstructions || 'Standard dispatch protocol initiated',
        },
        {
          timestamp: 'Upcoming',
          location: 'Carrier Consolidation Terminal',
          event: 'Freight intake & bill of lading generation',
          status: 'PENDING',
        },
      ],
      lastUpdated: 'Dispatch Generated',
    };

    shipments[waybillNo] = newShipment;

    executiveOverview.recentActivities.unshift({
      id: `ACT-${Date.now()}`,
      type: 'dispatch',
      title: `3PL Pickup Dispatched: ${waybillNo}`,
      description: `${carrier}: Order #${orderId} booked for ${destinationAddress || 'Customer Facility'}.`,
      timeAgo: 'Just now',
      timestamp: new Date().toISOString(),
      badgeColor: 'bg-secondary text-white',
      icon: 'local_shipping',
    });

    res.status(201).json({
      success: true,
      message: 'Dispatch and pickup created with 3PL logistics provider',
      waybillNo,
      shipment: newShipment,
      order,
    });
  });

  // 7. Data Export Endpoints (PDF & CSV)
  app.get('/api/v1/export/csv/:type', (req: Request, res: Response) => {
    const { type } = req.params;
    let csvContent = '';
    let filename = `logistics_erp_${type}_${Date.now()}.csv`;

    if (type === 'orders') {
      csvContent = 'Order ID,Customer,Date,Status,Total Amount,Region,Carrier,Waybill\n' +
        orders.map(o => `"${o.id}","${o.customerName}","${o.date}","${o.status}",${o.totalAmount},"${o.region}","${o.carrier || ''}","${o.waybillNo || ''}"`).join('\n');
    } else if (type === 'inventory') {
      csvContent = 'SKU,Product Name,Category,Warehouse,In Stock,Committed,Incoming,Unit Cost,Status\n' +
        inventory.map(i => `"${i.sku}","${i.name}","${i.category}","${i.warehouseName}",${i.inStock},${i.committed},${i.incoming},${i.unitCost},"${i.status}"`).join('\n');
    } else if (type === 'customers') {
      csvContent = 'Customer ID,Name,Tier,Primary Contact,Email,Phone,Credit Limit,Credit Utilized,YTD Revenue\n' +
        customers.map(c => `"${c.id}","${c.name}","${c.tier}","${c.primaryContact.name}","${c.primaryContact.email}","${c.primaryContact.phone}",${c.financials.creditLimit},${c.financials.creditUtilized},${c.financials.ytdRevenue}`).join('\n');
    } else {
      csvContent = 'Metric,Value\n' +
        `Total Revenue,$${executiveOverview.totalRevenue}\n` +
        `Total Orders,${executiveOverview.totalOrders}\n` +
        `Active Shipments,${executiveOverview.activeShipments}\n` +
        `Customer Satisfaction,${executiveOverview.customerSatisfaction}/5\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  });

  // Webhook Logs
  app.get('/api/v1/logistics/webhooks/logs', (req: Request, res: Response) => {
    res.json(webhookAuditLogs);
  });

  // Vite Middleware Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Logistics ERP Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
