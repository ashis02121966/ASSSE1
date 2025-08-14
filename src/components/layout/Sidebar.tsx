import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { MenuItem } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isCollapsed, onToggleCollapse }) => {
  const { user, hasRole, userMenuItems } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const hasAccess = (item: MenuItem): boolean => {
    if (!user) return false;
    if (user.permissions.includes('*')) return true;
    return item.roles.some(role => role === '*' || hasRole(role));
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent size={18} /> : <Icons.Circle size={18} />;
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    if (!hasAccess(item)) return null;

    const isExpanded = expandedItems.includes(item.id);
    const isActive = currentPath === item.path;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
              : 'text-gray-700 hover:bg-gray-50'
          } ${depth > 0 ? 'pl-8' : ''}`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              onNavigate(item.path);
            }
          }}
          title={isCollapsed ? item.title : ''}
        >
          <div className={`flex items-center flex-1 ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
              {getIcon(item.icon)}
            </span>
            {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
            {!isCollapsed && item.badge && item.badge > 0 && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          {!isCollapsed && hasChildren && (
            <span className="text-gray-400">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
        </div>

        {!isCollapsed && hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-gray-200 h-full overflow-y-auto transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      <nav className="mt-4">
        {userMenuItems.map(item => renderMenuItem(item))}
      </nav>
    </div>
  );
};

export default Sidebar;