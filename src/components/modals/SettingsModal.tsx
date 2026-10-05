import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreferences?: (prefs: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSavePreferences }) => {
  const [currency, setCurrency] = useState('USD ($)');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [autoRefreshSecs, setAutoRefreshSecs] = useState('30');
  const [defaultWarehouse, setDefaultWarehouse] = useState('WH-NA-01');
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState('whsec_erp_982347abcdf82934');
  const [showSecret, setShowSecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    if (onSavePreferences) {
      onSavePreferences({
        currency,
        dateFormat,
        autoRefreshSecs,
        defaultWarehouse,
        enableSoundAlerts,
        webhookSecret,
      });
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-[#242933] flex justify-between items-center bg-gray-50 dark:bg-[#151921]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">
                ERP Settings &amp; Preferences
              </h3>
              <p className="text-[12px] text-gray-500 dark:text-gray-400">
                Configure global system parameters, localization, and 3PL integrations.
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 text-[13px] flex-1">
          {/* Section: Regional & Localization */}
          <div>
            <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Localization &amp; Currency
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                  Accounting Base Currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>JPY (¥)</option>
                  <option>SGD (S$)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                  Display Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={e => setDateFormat(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>YYYY-MM-DD (ISO)</option>
                  <option>MMM DD, YYYY (US)</option>
                  <option>DD/MM/YYYY (EU)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-[#242933] pt-4">
            <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Logistics &amp; Hub Defaults
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                  Primary Fulfillment Center
                </label>
                <select
                  value={defaultWarehouse}
                  onChange={e => setDefaultWarehouse(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="WH-NA-01">North American Hub (NA-01)</option>
                  <option value="WH-EU-02">European Logistics Gateway (EU-02)</option>
                  <option value="WH-AP-03">Asia-Pacific Distribution Hub (AP-03)</option>
                  <option value="WH-TX-04">Central US Logistics Depot (TX-04)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1 text-[12px]">
                  Telematics Polling Interval
                </label>
                <select
                  value={autoRefreshSecs}
                  onChange={e => setAutoRefreshSecs(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg text-[13px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="15">Every 15 seconds (High Frequency)</option>
                  <option value="30">Every 30 seconds (Recommended)</option>
                  <option value="60">Every 60 seconds (Standard)</option>
                  <option value="0">Manual Refresh Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: 3PL Webhooks */}
          <div className="border-t border-gray-100 dark:border-[#242933] pt-4">
            <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              3PL Webhook Ingress Key
            </h4>
            <div className="space-y-2">
              <label className="font-semibold text-gray-700 dark:text-gray-300 block text-[12px]">
                Carrier Signing Secret (HMAC-SHA256)
              </label>
              <div className="flex gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={webhookSecret}
                  onChange={e => setWebhookSecret(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#1C222D] border border-gray-200 dark:border-[#242933] rounded-lg font-data-mono text-[12px] text-gray-800 dark:text-gray-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="px-3 py-2 border border-gray-200 dark:border-[#242933] rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1C222D] text-[12px]"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {showSecret ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Used to verify signature payloads arriving at <code>/api/v1/logistics/webhooks/tracking-update</code>.
              </p>
            </div>
          </div>

          {/* Notifications Toggle */}
          <div className="border-t border-gray-100 dark:border-[#242933] pt-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-200 text-[13px]">
                Audio Alert Chimes
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                Play subtle chime on incoming high-priority consignment alerts and disputes.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enableSoundAlerts}
                onChange={e => setEnableSoundAlerts(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#242933] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-[#242933] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 dark:border-[#242933] rounded-lg font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1C222D] text-[12px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-[12px] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              {isSaved ? 'Preferences Saved!' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
