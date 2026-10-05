import React, { useState } from 'react';
import { Customer, InventoryItem, Warehouse, Order, UserProfile } from '../../types';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  inventory: InventoryItem[];
  warehouses: Warehouse[];
  currentUser: UserProfile;
  preselectedCustomer?: Customer;
  onSubmit: (orderData: Partial<Order>) => Promise<void>;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  customers,
  inventory,
  warehouses,
  currentUser,
  preselectedCustomer,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [customerId, setCustomerId] = useState<string>(preselectedCustomer?.id || customers[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || 'WH-NA-01');
  const [carrier, setCarrier] = useState<string>('FedEx Freight');
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30');
  const [region, setRegion] = useState<string>('North America');
  const [shippingAddress, setShippingAddress] = useState<string>('220 N Wacker Dr, Chicago, IL 60606');
  const [notes, setNotes] = useState<string>('Standard commercial freight handling requested');

  const [items, setItems] = useState<Array<{ sku: string; name: string; quantity: number; unitPrice: number; totalPrice: number; weightKg: number }>>([
    { sku: 'EL-8890-A', name: 'Industrial Sensor Array V2', quantity: 10, unitPrice: 850.00, totalPrice: 8500.00, weightKg: 120 },
    { sku: 'CM-1024-B', name: 'Copper Wire Coil (500m)', quantity: 15, unitPrice: 263.33, totalPrice: 3950.00, weightKg: 350 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCust = customers.find(c => c.id === customerId);

  const handleAddItem = () => {
    const defaultItem = inventory[0] || { sku: 'EL-8890-A', name: 'Industrial Sensor Array V2', unitCost: 850 };
    setItems([
      ...items,
      {
        sku: defaultItem.sku,
        name: defaultItem.name,
        quantity: 5,
        unitPrice: Number((defaultItem.unitCost * 1.35).toFixed(2)),
        totalPrice: Number((defaultItem.unitCost * 1.35 * 5).toFixed(2)),
        weightKg: 50,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...items];
    const current = updated[index];

    if (field === 'sku') {
      const inv = inventory.find(i => i.sku === value);
      if (inv) {
        current.sku = inv.sku;
        current.name = inv.name;
        current.unitPrice = Number((inv.unitCost * 1.35).toFixed(2));
      }
    } else if (field === 'quantity') {
      current.quantity = Math.max(1, Number(value) || 1);
    } else if (field === 'unitPrice') {
      current.unitPrice = Number(value) || 0;
    }

    current.totalPrice = Number((current.quantity * current.unitPrice).toFixed(2));
    setItems(updated);
  };

  const grandTotal = items.reduce((sum, itm) => sum + itm.totalPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newOrderPayload: Partial<Order> = {
        customerId,
        customerName: selectedCust?.name || 'Client Corporation',
        customerInitials: selectedCust?.initials || 'CC',
        customerAvatarBg: 'bg-[#131b2e] text-[#7c839b]',
        status: 'Processing',
        totalAmount: grandTotal,
        region: region as any,
        shippingAddress,
        warehouseId,
        carrier: carrier as any,
        paymentTerms,
        notes,
        itemSummary: `${items.length * 4} Pallets`,
        items: items.map((itm, i) => ({
          id: `ITM-GEN-${i}`,
          sku: itm.sku,
          name: itm.name,
          quantity: itm.quantity,
          unitPrice: itm.unitPrice,
          totalPrice: itm.totalPrice,
          weightKg: itm.weightKg,
        })),
      };

      await onSubmit(newOrderPayload);
      onClose();
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-[#242933] flex justify-between items-center bg-gray-50 dark:bg-[#151921]">
          <div>
            <h3 className="text-[18px] font-bold text-gray-900 dark:text-white">
              Create New Sales &amp; Distribution Order
            </h3>
            <p className="text-[12px] text-gray-500 dark:text-gray-400">
              Generate sales consignment and allocate warehouse inventory.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-[13px]">
          {/* Section 1: Customer & Fulfillment Center */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                Customer Account
              </label>
              <select
                value={customerId}
                onChange={e => {
                  setCustomerId(e.target.value);
                  const cust = customers.find(c => c.id === e.target.value);
                  if (cust) {
                    setShippingAddress(cust.headquarters.mapQuery);
                  }
                }}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id}) - {c.tier}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                Fulfillment Hub
              </label>
              <select
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Shipping & Carrier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                Destination Consignee Address
              </label>
              <input
                type="text"
                value={shippingAddress}
                onChange={e => setShippingAddress(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                3PL Carrier
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

          {/* Section 3: Line Items */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white">
                Order Line Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Add Item
              </button>
            </div>

            <div className="border border-gray-200 dark:border-[#242933] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#1C222D] border-b border-gray-200 dark:border-[#242933] text-gray-500">
                    <th className="p-2.5 pl-3 font-semibold">SKU &amp; PRODUCT</th>
                    <th className="p-2.5 w-24 font-semibold">QTY</th>
                    <th className="p-2.5 w-28 text-right font-semibold">UNIT PRICE</th>
                    <th className="p-2.5 w-28 text-right font-semibold">TOTAL</th>
                    <th className="p-2.5 w-10 text-center" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#242933]">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-[#1C222D]/50">
                      <td className="p-2 pl-3">
                        <select
                          value={item.sku}
                          onChange={e => handleItemChange(idx, 'sku', e.target.value)}
                          className="w-full p-1.5 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded text-[12px] text-gray-800 dark:text-gray-200"
                        >
                          {inventory.map(inv => (
                            <option key={inv.sku} value={inv.sku}>
                              {inv.sku} - {inv.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-1.5 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded text-[12px] font-data-mono text-center text-gray-800 dark:text-gray-200"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full p-1.5 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded text-[12px] font-data-mono text-right text-gray-800 dark:text-gray-200"
                        />
                      </td>
                      <td className="p-2 text-right font-data-mono font-bold text-gray-900 dark:text-white">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={items.length === 1}
                          className="text-red-500 hover:text-red-400 disabled:opacity-30 p-1"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total summary */}
            <div className="flex justify-end pt-2 text-[14px]">
              <div className="text-right">
                <span className="text-gray-500">Total Order Value:</span>
                <span className="ml-3 font-data-mono font-bold text-[18px] text-emerald-600 dark:text-emerald-400">
                  ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
              Logistics Handling Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-[#242933] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[12px] font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !currentUser.permissions.canCreateOrders}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[12px] font-semibold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              {isSubmitting ? 'Creating Order...' : 'Submit & Book Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
