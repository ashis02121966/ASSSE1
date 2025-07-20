import React, { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../common/NotificationBell';
import { Notification } from '../../types';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Frame Upload Complete',
      message: 'ASI Frame 2023 Manufacturing has been successfully uploaded.',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
      userId: '1'
    },
    {
      id: '2',
      title: 'Survey Deadline Approaching',
      message: 'Survey deadline for Manufacturing sector is in 5 days.',
      type: 'warning',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: false,
      userId: '1'
    }
  ]);

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">
                ASSSE - Annual Survey of Service Sector Enterprises
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onClearAll={handleClearAll}
            />

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <img
                  src={user?.profileImage || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden md:block text-sm font-medium">
                  {user?.name}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-gray-600">{user?.email}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Roles: {user?.roles.map(r => r.name).join(', ')}
                      </div>
                    </div>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={16} className="mr-2" />
                      Profile
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings size={16} className="mr-2" />
                      Settings
                    </a>
                    <button
                      onClick={logout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;