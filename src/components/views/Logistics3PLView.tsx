import React, { useState, useEffect } from 'react';
import { ShipmentTracking, WebhookUpdatePayload, Order } from '../../types';
import { apiService } from '../../services/apiService';

interface Logistics3PLViewProps {
  initialWaybillNo?: string;
  orders: Order[];
  onOpenDispatchModal: () => void;
}

export const Logistics3PLView: React.FC<Logistics3PLViewProps> = ({
  initialWaybillNo = 'WB-8901-FDX',
  orders,
  onOpenDispatchModal,
}) => {
  const [waybillInput, setWaybillInput] = useState<string>(initialWaybillNo);
  const [currentWaybill, setCurrentWaybill] = useState<string>(initialWaybillNo);
  const [trackingData, setTrackingData] = useState<ShipmentTracking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState<boolean>(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);
  const [carrierSelect, setCarrierSelect] = useState<string>('FedEx Freight');
  const [newStatus, setNewStatus] = useState<string>('IN_TRANSIT');
  const [checkpointInput, setCheckpointInput] = useState<string>('Chicago South Suburban Gateway');
  const [remarksInput, setRemarksInput] = useState<string>('Arrived at logistics sorting bay dock 3');

  const fetchTracking = async (wb: string) => {
    setLoading(true);
    try {
      const data = await apiService.trackShipment(wb);
      setTrackingData(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking(currentWaybill);
  }, [currentWaybill]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waybillInput.trim()) {
      setCurrentWaybill(waybillInput.trim());
    }
  };

  const handleSendWebhook = async () => {
    setIsSimulatingWebhook(true);
    setWebhookMessage(null);
    try {
      const payload: WebhookUpdatePayload = {
        waybillNo: currentWaybill,
        carrier: carrierSelect,
        status: newStatus as any,
        checkpoint: checkpointInput,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        remarks: remarksInput,
        coordinates: {
          lat: 41.8781 + (Math.random() - 0.5) * 0.05,
          lng: -87.6298 + (Math.random() - 0.5) * 0.05,
        },
      };

      const result = await apiService.sendCarrierWebhook(payload);
      setWebhookMessage(`Carrier push received: ${result.message}`);
      await fetchTracking(currentWaybill);
    } catch {
      setWebhookMessage('Webhook push error');
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  return (
    <div id="logistics-3pl-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[26px] md:text-[28px] font-bold text-gray-900 dark:text-white tracking-tight">
              3PL Logistics &amp; Live Telemetry
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 tracking-widest uppercase animate-pulse">
              1Hz Feed
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time GPS coordinates, cold-chain temperature telemetry, and carrier API webhooks.
          </p>
        </div>

        <button
          id="btn-3pl-dispatch"
          onClick={onOpenDispatchModal}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] font-semibold shadow-sm transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          Dispatch 3PL Pickup
        </button>
      </div>

      {/* Waybill Search Bar */}
      <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-4 shadow-sm">
        <form onSubmit={handleTrackSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px] relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              qr_code_scanner
            </span>
            <input
              id="input-waybill-track"
              type="text"
              value={waybillInput}
              onChange={e => setWaybillInput(e.target.value)}
              placeholder="Enter 3PL Waybill No (e.g. WB-8901-FDX, WB-8895-DHL)..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-900 dark:text-white font-data-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            Track Live Waybill
          </button>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
            <span className="font-semibold text-gray-500">Presets:</span>
            {['WB-8901-FDX', 'WB-8895-DHL', 'WB-8872-FDX'].map(wb => (
              <button
                type="button"
                key={wb}
                onClick={() => {
                  setWaybillInput(wb);
                  setCurrentWaybill(wb);
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-data-mono transition-colors ${
                  currentWaybill === wb
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'bg-gray-50 dark:bg-[#1C222D] border-gray-200 dark:border-[#242933] text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
              >
                {wb}
              </button>
            ))}
          </div>
        </form>
      </div>

      {loading || !trackingData ? (
        <div className="p-12 text-center text-gray-400 bg-white dark:bg-[#151921] rounded-xl border border-gray-200 dark:border-[#242933]">
          <span className="material-symbols-outlined text-[36px] animate-spin text-emerald-500">
            refresh
          </span>
          <p className="mt-2 text-[14px]">Fetching live telematics from 3PL partner...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Active Telemetry & Map Card (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Shipment Overview Card */}
            <div
              id="card-active-shipment"
              className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[19px] font-bold text-gray-900 dark:text-white font-data-mono">
                      {trackingData.waybillNo}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {trackingData.carrier}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Service: <span className="font-semibold text-gray-700 dark:text-gray-300">{trackingData.serviceType}</span> | Order:{' '}
                    <span className="font-data-mono font-semibold text-emerald-600 dark:text-emerald-400">{trackingData.orderId}</span>
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                    trackingData.status === 'DELIVERED'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : trackingData.status === 'OUT_FOR_DELIVERY'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      : 'bg-gray-500/10 text-gray-600 dark:text-gray-300 border border-gray-500/20'
                  }`}
                >
                  {trackingData.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Origin -> Destination Route Banner */}
              <div className="p-3.5 bg-gray-50 dark:bg-[#1C222D] rounded-xl border border-gray-200 dark:border-[#242933] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    ORIGIN HUB
                  </span>
                  <div className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                    {trackingData.origin.facility}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {trackingData.origin.city}, {trackingData.origin.country}
                  </div>
                </div>

                <div className="flex flex-col items-center shrink-0 px-2">
                  <span className="text-[11px] font-data-mono font-bold text-emerald-500">
                    {trackingData.progressPct}%
                  </span>
                  <span className="material-symbols-outlined text-emerald-500 text-[20px]">
                    arrow_forward
                  </span>
                </div>

                <div className="min-w-0 text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    DESTINATION
                  </span>
                  <div className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                    {trackingData.destination.customer}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {trackingData.destination.city}, {trackingData.destination.country}
                  </div>
                </div>
              </div>

              {/* Telemetry Gauges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {/* Speed */}
                <div className="p-3 bg-gray-50 dark:bg-[#1C222D] rounded-lg border border-gray-200 dark:border-[#242933]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">TELEMATIC SPEED</span>
                  <div className="text-[18px] font-bold font-data-mono text-gray-900 dark:text-white mt-0.5">
                    {trackingData.actualSpeedKmH} km/h
                  </div>
                </div>

                {/* Cargo Temp */}
                <div className="p-3 bg-gray-50 dark:bg-[#1C222D] rounded-lg border border-gray-200 dark:border-[#242933]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">COLD CHAIN TEMP</span>
                  <div className="text-[18px] font-bold font-data-mono text-emerald-500 mt-0.5 flex items-center gap-1">
                    {trackingData.cargoTempCelsius}°C
                    <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-sans">
                      Normal
                    </span>
                  </div>
                </div>

                {/* Fuel Level */}
                <div className="p-3 bg-gray-50 dark:bg-[#1C222D] rounded-lg border border-gray-200 dark:border-[#242933]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">FLEET FUEL</span>
                  <div className="text-[18px] font-bold font-data-mono text-gray-900 dark:text-white mt-0.5">
                    {trackingData.fuelLevelPct}%
                  </div>
                </div>

                {/* Driver */}
                <div className="p-3 bg-gray-50 dark:bg-[#1C222D] rounded-lg border border-gray-200 dark:border-[#242933]">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">COURIER DRIVER</span>
                  <div className="text-[12px] font-bold text-gray-900 dark:text-white mt-0.5 truncate">
                    {trackingData.driverName}
                  </div>
                  <div className="text-[10px] font-data-mono text-gray-400">{trackingData.licensePlate}</div>
                </div>
              </div>
            </div>

            {/* Waypoints Route Checklist */}
            <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm">
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white mb-4">
                Telemetry Route &amp; Checkpoints
              </h3>

              <div className="relative pl-3 space-y-4">
                <div className="absolute left-[16px] top-2 bottom-3 w-px bg-gray-200 dark:bg-[#242933]" />

                {trackingData.waypoints.map((wp, idx) => (
                  <div key={idx} className="relative flex gap-3.5 items-start">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-[#151921] ${
                        wp.status === 'COMPLETED'
                          ? 'bg-emerald-500 text-white'
                          : wp.status === 'IN_PROGRESS'
                          ? 'bg-emerald-500 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-500 dark:bg-[#242933]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {wp.status === 'COMPLETED' ? 'check' : wp.status === 'IN_PROGRESS' ? 'local_shipping' : 'schedule'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-white">
                          {wp.location}
                        </span>
                        <span className="text-[11px] font-data-mono text-gray-400">
                          {wp.timestamp}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {wp.event}
                      </p>
                      {wp.notes && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 italic mt-0.5">
                          Note: {wp.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Carrier Webhook Test Bench Simulator (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div
              id="card-webhook-testbench"
              className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-emerald-500 text-[22px]">
                  webhook
                </span>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">
                    Carrier Webhook Test Bench
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Push test events directly into <code className="text-emerald-500 font-data-mono">POST /api/v1/logistics/webhooks/tracking-update</code>
                  </p>
                </div>
              </div>

              {webhookMessage && (
                <div className="p-3 mb-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[12px] text-emerald-600 dark:text-emerald-300">
                  {webhookMessage}
                </div>
              )}

              <div className="space-y-3 text-[13px]">
                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400 block mb-1 text-[12px]">
                    Carrier Partner
                  </label>
                  <select
                    value={carrierSelect}
                    onChange={e => setCarrierSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option>FedEx Freight</option>
                    <option>DHL Global Forwarding</option>
                    <option>Maersk Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400 block mb-1 text-[12px]">
                    Telemetry Status Event
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="IN_TRANSIT">IN_TRANSIT (En Route)</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Final Mile)</option>
                    <option value="DELIVERED">DELIVERED (Dock Signed)</option>
                    <option value="CUSTOMS_HOLD">CUSTOMS_HOLD (Inspection Hold)</option>
                    <option value="WEATHER_DELAY">WEATHER_DELAY (Corridor Reroute)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400 block mb-1 text-[12px]">
                    Checkpoint Location
                  </label>
                  <input
                    type="text"
                    value={checkpointInput}
                    onChange={e => setCheckpointInput(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-600 dark:text-gray-400 block mb-1 text-[12px]">
                    Carrier Remarks / Notes
                  </label>
                  <input
                    type="text"
                    value={remarksInput}
                    onChange={e => setRemarksInput(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendWebhook}
                  disabled={isSimulatingWebhook}
                  className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  {isSimulatingWebhook ? 'Triggering Carrier Push...' : 'Simulate Inbound Carrier Push'}
                </button>
              </div>
            </div>

            {/* Quick Dispatch Links */}
            <div className="p-4 bg-gray-50 dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-xl text-[13px] shadow-sm">
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                Active Waybill Registry
              </h4>
              <p className="text-[12px] text-gray-400 mb-3">
                All live 3PL consignment numbers linked to sales orders.
              </p>
              <div className="space-y-2">
                {orders
                  .filter(o => o.waybillNo)
                  .map(o => (
                    <div
                      key={o.id}
                      onClick={() => {
                        setWaybillInput(o.waybillNo!);
                        setCurrentWaybill(o.waybillNo!);
                      }}
                      className="p-2.5 bg-white dark:bg-[#1C222D] rounded-lg border border-gray-200 dark:border-[#242933] flex justify-between items-center cursor-pointer hover:border-emerald-500 transition-colors"
                    >
                      <div>
                        <div className="font-data-mono font-bold text-emerald-600 dark:text-emerald-400 text-[12px]">
                          {o.waybillNo}
                        </div>
                        <div className="text-[11px] text-gray-400">{o.customerName}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-[#242933] text-gray-600 dark:text-gray-300">
                        {o.carrier}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
