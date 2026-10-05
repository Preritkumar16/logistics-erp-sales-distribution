import React from 'react';
import { UserProfile, ViewType } from '../../types';

export type NavTab = 'dashboard' | 'orders' | 'inventory' | 'customers' | 'analytics' | 'logistics' | 'logistics3pl';

interface SideNavBarProps {
  activeView?: ViewType;
  activeTab?: NavTab;
  onViewChange?: (view: ViewType) => void;
  onTabChange?: (tab: NavTab) => void;
  onOpenCreateOrder: () => void;
  currentUser: UserProfile;
  onOpenSettings?: () => void;
  onOpenSupport?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeView,
  activeTab,
  onViewChange,
  onTabChange,
  onOpenCreateOrder,
  currentUser,
  onOpenSettings,
  onOpenSupport,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  // Normalize current view ID
  const current = activeView || (activeTab === 'logistics3pl' ? 'logistics' : activeTab) || 'dashboard';

  const handleSelect = (id: ViewType) => {
    if (onViewChange) {
      onViewChange(id);
    } else if (onTabChange) {
      onTabChange(id as NavTab);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navItems: Array<{ id: ViewType; label: string; icon: string; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'orders', label: 'Orders', icon: 'shopping_cart' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
    { id: 'customers', label: 'Customers', icon: 'group' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'logistics', label: '3PL Live Tracking', icon: 'local_shipping', badge: 'LIVE' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        id="side-nav-bar"
        className={`fixed top-0 bottom-0 left-0 w-60 z-50 bg-white dark:bg-[#0F1219] flex flex-col border-r border-gray-200 dark:border-[#242933] shadow-lg md:shadow-none transition-transform duration-200 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-[#242933] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black text-sm shrink-0 shadow-sm">
              V
            </div>
            <div className="overflow-hidden">
              <h1 className="text-[17px] font-bold leading-tight text-gray-900 dark:text-white tracking-tight truncate">
                VENTURE<span className="text-emerald-500">ERP</span>
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate uppercase font-semibold tracking-wider">
                Sales &amp; Distribution
              </p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-2">
            Main Modules
          </div>
          <ul className="space-y-1">
            {navItems.map(item => {
              const isActive = current === item.id;
              return (
                <li key={item.id}>
                  <button
                    id={`nav-${item.id}`}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all font-medium text-[13px] ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border-l-3 border-emerald-500 shadow-xs'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1C222D]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-[19px] ${isActive ? 'fill-1' : ''}`}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 tracking-wider">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Role Badge Indicator */}
        <div className="p-3 mx-2 mb-2 bg-gray-50 dark:bg-[#1C222D] rounded-xl border border-gray-200 dark:border-[#242933]">
          <div className="flex items-center gap-2.5">
            <img
              className="w-7 h-7 rounded-full object-cover border border-emerald-500/30 shrink-0"
              alt="Active user"
              src={currentUser.avatarUrl}
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-gray-900 dark:text-gray-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider truncate">
                {currentUser.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="p-3 border-t border-gray-200 dark:border-[#242933]">
          <button
            id="btn-sidebar-create-order"
            onClick={() => {
              onOpenCreateOrder();
              if (onCloseMobile) onCloseMobile();
            }}
            disabled={!currentUser.permissions.canCreateOrders}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-3 py-2 text-[12px] font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={!currentUser.permissions.canCreateOrders ? 'Role permissions restrict order creation' : 'Create New Sales Order'}
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Create New Order
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="pb-3 pt-1 border-t border-gray-200 dark:border-[#242933] px-2">
          <ul className="space-y-0.5">
            <li>
              <button
                id="nav-settings"
                onClick={() => {
                  if (onOpenSettings) onOpenSettings();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1C222D] rounded-lg transition-colors text-[12px]"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                Settings &amp; Preferences
              </button>
            </li>
            <li>
              <button
                id="nav-support"
                onClick={() => {
                  if (onOpenSupport) onOpenSupport();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1C222D] rounded-lg transition-colors text-[12px]"
              >
                <span className="material-symbols-outlined text-[18px]">help</span>
                Support &amp; API Docs
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};
