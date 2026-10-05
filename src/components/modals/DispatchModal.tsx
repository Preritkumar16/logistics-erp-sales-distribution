import React, { useState } from 'react';
import { Order, Warehouse } from '../../types';

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  warehouses: Warehouse[];
  onSubmit: (payload: { orderId: string; warehouseId: string; carrier: string; serviceType: string; pickupDate: string }) => Promise<void>;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  orders,
  warehouses,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const eligibleOrders = orders.filter(o => o.status === 'Processing' || !o.waybillNo);
  const [orderId, setOrderId] = useState<string>(eligibleOrders[0]?.id || orders[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || '');
  const [carrier, setCarrier] = useState<string>('FedEx Freight');
  const [serviceType, setServiceType] = useState<string>('Priority Freight');
  const [pickupDate, setPickupDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ orderId, warehouseId, carrier, serviceType, pickupDate });
      onClose();
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-[#242933] flex justify-between items-center bg-gray-50 dark:bg-[#151921]">
          <div>
            <h3 className="text-[18px] font-bold text-gray-900 dark:text-white">
              Dispatch 3PL Pickup
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">
              Issue logistics consignment waybill and courier dispatch order.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[13px]">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
              Select Sales Order
            </label>
            <select
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg font-data-mono text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.id} - {o.customerName} (${o.totalAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                Dispatch Origin Hub
              </label>
              <select
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                3PL Partner
              </label>
              <select
                value={carrier}
                onChange={e => setCarrier(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              >
                <option>FedEx Freight</option>
                <option>DHL Global Forwarding</option>
                <option>Maersk Logistics</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                Service Speed
              </label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              >
                <option>Priority Freight</option>
                <option>Standard Ground LTL</option>
                <option>Cold-Chain Express</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={e => setPickupDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-[#242933] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 dark:border-[#242933] rounded-lg font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1C222D] text-[12px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-[12px] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              {isSubmitting ? 'Dispatching...' : 'Dispatch Consignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
