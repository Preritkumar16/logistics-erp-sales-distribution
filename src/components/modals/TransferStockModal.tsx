import React, { useState } from 'react';
import { InventoryItem, Warehouse } from '../../types';

interface TransferStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  warehouses: Warehouse[];
  preselectedItem?: InventoryItem;
  onSubmit: (payload: { sku: string; fromWarehouseId: string; toWarehouseId: string; quantity: number }) => Promise<void>;
}

export const TransferStockModal: React.FC<TransferStockModalProps> = ({
  isOpen,
  onClose,
  inventory,
  warehouses,
  preselectedItem,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [sku, setSku] = useState<string>(preselectedItem?.sku || inventory[0]?.sku || '');
  const [fromWarehouseId, setFromWarehouseId] = useState<string>(preselectedItem?.warehouseId || warehouses[0]?.id || '');
  const [toWarehouseId, setToWarehouseId] = useState<string>(warehouses[1]?.id || warehouses[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedItem = inventory.find(i => i.sku === sku);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouseId === toWarehouseId) {
      alert('Source and destination warehouse cannot be identical.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ sku, fromWarehouseId, toWarehouseId, quantity });
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
              Internal Stock Transfer
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">
              Transfer inventory between distribution centers.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D]">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[13px]">
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
              Select Item SKU
            </label>
            <select
              value={sku}
              onChange={e => setSku(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
            >
              {inventory.map(item => (
                <option key={item.sku} value={item.sku}>
                  {item.sku} - {item.name} ({item.inStock} available)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                From Facility
              </label>
              <select
                value={fromWarehouseId}
                onChange={e => setFromWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                To Facility
              </label>
              <select
                value={toWarehouseId}
                onChange={e => setToWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
              Transfer Quantity (Units)
            </label>
            <input
              type="number"
              min="1"
              max={selectedItem?.inStock || 9999}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value) || 1)}
              required
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg font-data-mono text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
            />
            {selectedItem && (
              <span className="text-[11px] text-gray-400 mt-1 block">
                Available at source: {selectedItem.inStock} units
              </span>
            )}
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
              <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
              {isSubmitting ? 'Transferring...' : 'Execute Stock Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
