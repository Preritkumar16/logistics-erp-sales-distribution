import React, { useState } from 'react';
import { Order, OrderStatus, UserProfile } from '../../types';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onTrack3PL: (waybillNo: string) => void;
  onPrintInvoice: (order: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  currentUser,
  onUpdateStatus,
  onTrack3PL,
  onPrintInvoice,
}) => {
  if (!isOpen || !order) return null;

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const handleStatusChange = async (newSt: OrderStatus) => {
    setSelectedStatus(newSt);
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, newSt);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-[#242933] flex justify-between items-center bg-gray-50 dark:bg-[#151921]">
          <div className="flex items-center gap-3">
            <div className="font-data-mono font-bold text-[18px] text-emerald-600 dark:text-emerald-400">
              {order.id}
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold ${
                order.status === 'Delivered'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : order.status === 'Processing'
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : 'bg-gray-500/10 text-gray-600 dark:text-gray-300 border border-gray-500/20'
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintInvoice(order)}
              className="px-3 py-1.5 border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-[#1C222D] text-gray-700 dark:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              Export Slip
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D]">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-[13px]">
          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-[#1C222D] rounded-xl border border-gray-200 dark:border-[#242933]">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                CONSIGNEE / CUSTOMER
              </span>
              <div className="font-bold text-[15px] text-gray-900 dark:text-white mt-0.5">
                {order.customerName}
              </div>
              <div className="text-[12px] text-gray-500 dark:text-gray-400 font-data-mono">
                {order.customerId}
              </div>
              <div className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
                Destination: {order.shippingAddress}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                LOGISTICS &amp; FULFILLMENT
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-[12px]">Carrier:</span>
                <span className="text-gray-900 dark:text-white text-[12px]">{order.carrier}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-[12px]">Waybill:</span>
                {order.waybillNo ? (
                  <button
                    onClick={() => {
                      onClose();
                      onTrack3PL(order.waybillNo!);
                    }}
                    className="font-data-mono font-bold text-emerald-600 dark:text-emerald-400 underline flex items-center gap-1 text-[12px]"
                  >
                    {order.waybillNo}
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </button>
                ) : (
                  <span className="text-gray-400 text-[12px]">Not dispatched yet</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-[12px]">Payment Terms:</span>
                <span className="text-gray-900 dark:text-white text-[12px]">{order.paymentTerms || 'Net 30'}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">
              Consignment Items ({order.items.length})
            </h4>
            <div className="border border-gray-200 dark:border-[#242933] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead className="bg-gray-50 dark:bg-[#1C222D] border-b border-gray-200 dark:border-[#242933] text-gray-500">
                  <tr>
                    <th className="p-2.5 pl-3 font-semibold">SKU</th>
                    <th className="p-2.5 font-semibold">DESCRIPTION</th>
                    <th className="p-2.5 text-right font-semibold">QTY</th>
                    <th className="p-2.5 text-right font-semibold">UNIT PRICE</th>
                    <th className="p-2.5 pr-3 text-right font-semibold">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#242933]">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-[#1C222D]/50">
                      <td className="p-2.5 pl-3 font-data-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.sku}
                      </td>
                      <td className="p-2.5 text-gray-900 dark:text-white">{item.name}</td>
                      <td className="p-2.5 text-right font-data-mono text-gray-700 dark:text-gray-300">{item.quantity}</td>
                      <td className="p-2.5 text-right font-data-mono text-gray-700 dark:text-gray-300">${item.unitPrice.toFixed(2)}</td>
                      <td className="p-2.5 pr-3 text-right font-data-mono font-bold text-gray-900 dark:text-white">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="p-3.5 mt-3 bg-gray-50 dark:bg-[#1C222D] rounded-xl border border-gray-200 dark:border-[#242933] flex justify-between items-center text-[14px]">
              <span className="font-semibold text-gray-600 dark:text-gray-400 text-[13px]">Gross Total Value:</span>
              <span className="font-data-mono font-bold text-[18px] text-emerald-600 dark:text-emerald-400">
                ${order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Status Controls for authorized roles */}
          {currentUser.permissions.canEditOrders && (
            <div className="pt-3 border-t border-gray-200 dark:border-[#242933] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 dark:text-gray-300 text-[12px]">
                  Update Status:
                </span>
                <select
                  value={selectedStatus}
                  onChange={e => handleStatusChange(e.target.value as OrderStatus)}
                  disabled={isUpdating}
                  className="px-3 py-1.5 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg font-semibold text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Disputed">Disputed</option>
                </select>
                {isUpdating && <span className="text-[11px] text-emerald-500 animate-pulse">Saving...</span>}
              </div>

              {order.waybillNo && (
                <button
                  onClick={() => {
                    onClose();
                    onTrack3PL(order.waybillNo!);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  Launch 3PL Telematics
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
