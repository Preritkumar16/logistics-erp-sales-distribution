import React, { useState } from 'react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [activeTopic, setActiveTopic] = useState<'quickstart' | 'api' | 'telematics' | 'shortcuts'>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-[#242933] flex justify-between items-center bg-gray-50 dark:bg-[#151921]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <span className="material-symbols-outlined text-[20px]">help</span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">
                VentureERP Knowledge Base &amp; API Docs
              </h3>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Operational workflows, 3PL telematics ingestion, and keyboard navigation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 dark:border-[#242933] px-6 bg-gray-50/50 dark:bg-[#1C222D]/40 text-[13px]">
          <button
            onClick={() => setActiveTopic('quickstart')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTopic === 'quickstart'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Quickstart Workflows
          </button>
          <button
            onClick={() => setActiveTopic('api')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTopic === 'api'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            REST API Endpoints
          </button>
          <button
            onClick={() => setActiveTopic('telematics')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTopic === 'telematics'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            3PL Webhook Specs
          </button>
          <button
            onClick={() => setActiveTopic('shortcuts')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors ${
              activeTopic === 'shortcuts'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Keyboard Shortcuts
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
          {activeTopic === 'quickstart' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  End-to-End Sales &amp; Logistics Lifecycle
                </div>
                <p className="text-[12px]">
                  VentureERP connects order generation, multi-facility inventory allocation, and automated carrier dispatch with real-time IoT tracking.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-[13px]">Create &amp; Allocate Orders</h4>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Use the <strong>"Create New Order"</strong> button to specify customer, items, and target warehouse. The system validates inventory commitments in real-time.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-[13px]">Book 3PL Dispatch Consignments</h4>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      From the Order Details or 3PL screen, book courier pickups (FedEx, DHL, UPS) which generates waybill numbers and automated bills of lading.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-[13px]">Live Telematics &amp; Webhooks</h4>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Monitor live GPS positions, route checkpoints, temperature, and shock sensor alerts directly in the 3PL Live Tracking hub.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'api' && (
            <div className="space-y-3 font-mono text-[12px]">
              <div className="p-3 bg-gray-50 dark:bg-[#1C222D] rounded-xl border border-gray-200 dark:border-[#242933] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">GET</span>
                  <span className="text-gray-900 dark:text-gray-200">/api/v1/overview</span>
                </div>
                <p className="font-sans text-[11px] text-gray-500 dark:text-gray-400">
                  Retrieves executive KPI metrics, sales velocity, regional distributions, and recent audit activity.
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#1C222D] rounded-xl border border-gray-200 dark:border-[#242933] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                  <span className="text-gray-900 dark:text-gray-200">/api/v1/orders</span>
                </div>
                <p className="font-sans text-[11px] text-gray-500 dark:text-gray-400">
                  Creates a new sales order, reserves inventory, and updates customer credit utilization.
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-[#1C222D] rounded-xl border border-gray-200 dark:border-[#242933] space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px]">GET</span>
                  <span className="text-gray-900 dark:text-gray-200">/api/v1/logistics/shipments/track/:waybill</span>
                </div>
                <p className="font-sans text-[11px] text-gray-500 dark:text-gray-400">
                  Fetches live GPS coordinates, checkpoint progression, and environmental telemetry metrics.
                </p>
              </div>
            </div>
          )}

          {activeTopic === 'telematics' && (
            <div className="space-y-3">
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Carriers send automated JSON webhooks to broadcast status checkpoints:
              </p>
              <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto border border-gray-800">
{`POST /api/v1/logistics/webhooks/tracking-update
{
  "waybillNo": "WB-8901-FDX",
  "carrier": "FedEx Freight",
  "status": "IN_TRANSIT",
  "checkpoint": "Chicago Regional Distribution Center",
  "timestamp": "2024-03-20 14:30",
  "remarks": "Passed security inspection and loaded on trailer"
}`}
              </pre>
            </div>
          )}

          {activeTopic === 'shortcuts' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="p-2.5 bg-gray-50 dark:bg-[#1C222D] rounded-lg flex justify-between items-center border border-gray-200 dark:border-[#242933]">
                  <span>Quick Search</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-[#242933] rounded shadow-xs text-[11px] font-mono border border-gray-300 dark:border-gray-600">
                    /
                  </kbd>
                </div>
                <div className="p-2.5 bg-gray-50 dark:bg-[#1C222D] rounded-lg flex justify-between items-center border border-gray-200 dark:border-[#242933]">
                  <span>New Order</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-[#242933] rounded shadow-xs text-[11px] font-mono border border-gray-300 dark:border-gray-600">
                    Alt + N
                  </kbd>
                </div>
                <div className="p-2.5 bg-gray-50 dark:bg-[#1C222D] rounded-lg flex justify-between items-center border border-gray-200 dark:border-[#242933]">
                  <span>Dashboard View</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-[#242933] rounded shadow-xs text-[11px] font-mono border border-gray-300 dark:border-gray-600">
                    Alt + 1
                  </kbd>
                </div>
                <div className="p-2.5 bg-gray-50 dark:bg-[#1C222D] rounded-lg flex justify-between items-center border border-gray-200 dark:border-[#242933]">
                  <span>3PL Live Tracker</span>
                  <kbd className="px-2 py-1 bg-white dark:bg-[#242933] rounded shadow-xs text-[11px] font-mono border border-gray-300 dark:border-gray-600">
                    Alt + 6
                  </kbd>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-[#242933] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-[12px] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
