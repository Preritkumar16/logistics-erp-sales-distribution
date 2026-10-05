import React, { useState } from 'react';
import { UserProfile, UserRole } from '../../types';
import { SYSTEM_USERS } from '../../data/mockData';

interface TopNavBarProps {
  currentUser: UserProfile;
  usersList?: UserProfile[];
  onRoleChange: (role: UserRole) => void;
  isDarkMode?: boolean;
  darkMode?: boolean;
  onToggleDarkMode: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  onToggleMobileMenu?: () => void;
  onOpenSettings?: () => void;
  onOpenSupport?: () => void;
  recentAuditLogs?: Array<{ id: string; title: string; timeAgo: string; icon: string }>;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  currentUser,
  usersList = SYSTEM_USERS,
  onRoleChange,
  isDarkMode,
  darkMode,
  onToggleDarkMode,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  onSearchSubmit,
  onToggleMobileMenu,
  onOpenSettings,
  onOpenSupport,
  recentAuditLogs = [],
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [internalQuery, setInternalQuery] = useState('');

  // Notifications mock state
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'High Velocity Consignment',
      desc: 'Order #ORD-2023-8902 dispatched with FedEx Priority Freight.',
      time: '12m ago',
      read: false,
      type: 'info',
    },
    {
      id: 'notif-2',
      title: 'Inventory Threshold Triggered',
      desc: 'SKU EL-8890-A reached safety reorder point at NA-01 Hub.',
      time: '45m ago',
      read: false,
      type: 'warning',
    },
    {
      id: 'notif-3',
      title: '3PL Webhook Ingestion',
      desc: 'Shipment WB-8901-FDX arrived at Chicago Gateway sorting bay.',
      time: '1h ago',
      read: true,
      type: 'success',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isDark = isDarkMode !== undefined ? isDarkMode : Boolean(darkMode);
  const currentQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalQuery;

  const handleSearchChange = (val: string) => {
    if (externalOnSearchChange) {
      externalOnSearchChange(val);
    } else {
      setInternalQuery(val);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit(currentQuery);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <header
      id="top-nav-bar"
      className="sticky top-0 z-30 w-full bg-white dark:bg-[#0F1219] border-b border-gray-200 dark:border-[#242933] flex justify-between items-center h-[56px] px-4 sm:px-6 transition-colors shadow-xs"
    >
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile Hamburger Button */}
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#1C222D]"
          title="Open menu"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Global Search Bar */}
        <div className="relative rounded-lg bg-gray-50 dark:bg-[#1C222D] transition-all flex items-center w-full max-w-xs sm:max-w-sm md:max-w-md border border-gray-200 dark:border-[#242933] focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
          <span className="material-symbols-outlined absolute left-3 text-gray-400 dark:text-gray-500 text-[18px] pointer-events-none">
            search
          </span>
          <input
            id="global-search-input"
            type="text"
            value={currentQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search orders, customers, SKUs, or waybills..."
            className="pl-9 pr-8 py-1.5 bg-transparent border-none text-[13px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none w-full"
          />
          {currentQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-2 text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Tools, Theme Toggle, Notifications, Audit, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Dark Mode Toggle */}
        <button
          id="btn-dark-mode-toggle"
          onClick={onToggleDarkMode}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1C222D] rounded-lg transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <span className="material-symbols-outlined text-[19px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications Flyout Trigger */}
        <div className="relative">
          <button
            id="btn-top-notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowAuditLogs(false);
              setShowRoleMenu(false);
            }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1C222D] rounded-lg transition-colors relative"
            title="Notifications & Alerts"
          >
            <span className="material-symbols-outlined text-[19px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0F1219]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                <div className="p-3.5 border-b border-gray-100 dark:border-[#242933] flex justify-between items-center bg-gray-50 dark:bg-[#1C222D]/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        Mark read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-[#242933] text-[12px]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 dark:text-gray-500">
                      <span className="material-symbols-outlined text-[32px] mb-1 block opacity-40">
                        notifications_off
                      </span>
                      No unread alerts or notifications
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3.5 hover:bg-gray-50 dark:hover:bg-[#1C222D] transition-colors ${
                          !n.read ? 'bg-emerald-500/5' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-900 dark:text-white">{n.title}</span>
                          <span className="text-[10px] text-gray-400 font-data-mono">{n.time}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                          {n.desc}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Audit Log / History Flyout Trigger */}
        <div className="relative">
          <button
            id="btn-top-history"
            onClick={() => {
              setShowAuditLogs(!showAuditLogs);
              setShowNotifications(false);
              setShowRoleMenu(false);
            }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1C222D] rounded-lg transition-colors"
            title="Audit Logs & Activity"
          >
            <span className="material-symbols-outlined text-[19px]">history</span>
          </button>

          {/* Audit Logs Dropdown */}
          {showAuditLogs && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAuditLogs(false)} />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                <div className="p-3.5 border-b border-gray-100 dark:border-[#242933] flex justify-between items-center bg-gray-50 dark:bg-[#1C222D]/60">
                  <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                    System Audit Trail
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Live Session
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-[#242933] text-[12px]">
                  {recentAuditLogs.length === 0 ? (
                    <div className="p-4 space-y-3">
                      <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5">
                          check_circle
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-[12px]">
                            Session Synchronized
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            WMS multi-hub telemetry connected and verified.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-blue-500 text-[18px] mt-0.5">
                          local_shipping
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-[12px]">
                            3PL Carrier Carrier Feeds Ready
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            FedEx, DHL, and UPS webhook endpoints listening.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    recentAuditLogs.map(log => (
                      <div key={log.id} className="p-3 hover:bg-gray-50 dark:hover:bg-[#1C222D] flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-emerald-500 text-[16px]">
                            {log.icon}
                          </span>
                          <span className="text-gray-800 dark:text-gray-200 text-[12px] font-medium">
                            {log.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-data-mono">{log.timeAgo}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Support Help Button */}
        {onOpenSupport && (
          <button
            id="btn-top-help"
            onClick={onOpenSupport}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1C222D] rounded-lg transition-colors hidden sm:block"
            title="Knowledge Base & API Docs"
          >
            <span className="material-symbols-outlined text-[19px]">help</span>
          </button>
        )}

        <div className="h-5 w-px bg-gray-200 dark:bg-[#242933] mx-1" />

        {/* RBAC Role Switcher & User Avatar */}
        <div className="relative">
          <button
            id="btn-user-role-menu"
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifications(false);
              setShowAuditLogs(false);
            }}
            className="flex items-center gap-2 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-gray-50 dark:bg-[#1C222D] hover:bg-gray-100 dark:hover:bg-[#242933] transition-colors border border-gray-200 dark:border-[#242933]"
          >
            <div className="text-right hidden lg:block">
              <div className="text-[12px] font-semibold text-gray-900 dark:text-gray-200 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
            <img
              className="w-7 h-7 rounded-full object-cover border border-emerald-500/30"
              alt="User profile"
              src={currentUser.avatarUrl}
            />
            <span className="material-symbols-outlined text-[16px] text-gray-400">
              arrow_drop_down
            </span>
          </button>

          {/* Role selection dropdown */}
          {showRoleMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#151921] border border-gray-200 dark:border-[#242933] rounded-2xl shadow-2xl z-50 p-2 text-[13px] animate-fade-in">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-[#242933] mb-1">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                    Role-Based Access Control (RBAC)
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Switch persona to test role permissions
                  </p>
                </div>

                <div className="space-y-1">
                  {usersList.map(user => {
                    const isCurrent = user.role === currentUser.role;
                    return (
                      <button
                        key={user.id}
                        onClick={() => {
                          onRoleChange(user.role);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors ${
                          isCurrent
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'hover:bg-gray-50 dark:hover:bg-[#1C222D] text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">
                            {user.name}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {user.roleTitle}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="material-symbols-outlined text-[18px] text-emerald-500">
                            check
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {onOpenSettings && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#242933]">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1C222D] text-[12px]"
                    >
                      <span className="material-symbols-outlined text-[16px]">settings</span>
                      Preferences &amp; Defaults
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
