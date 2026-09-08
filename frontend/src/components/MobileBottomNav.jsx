import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Layers, Users, Activity, BarChart3, UserCheck, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const { currentUser } = useAuth();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!currentUser) return '/demo-login';
    switch (currentUser.role) {
      case 'citizen': return '/dashboard/citizen';
      case 'student': return '/dashboard/student';
      case 'expert':
      case 'industry': return '/dashboard/expert';
      case 'admin': return '/dashboard/admin';
      default: return '/dashboard/citizen';
    }
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Home, exact: true },
    { to: '/challenges', label: 'Problems', icon: Layers },
    { to: '/teams/1', label: 'Workspace', icon: Users },
    { to: '/progress/1', label: 'Progress', icon: Activity },
    { to: getDashboardPath(), label: 'Dashboard', icon: UserCheck }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 pt-1 pb-[calc(0.25rem+var(--safe-bottom))]"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl touch-target transition-all ${
                isActive 
                  ? 'text-teal-700 font-semibold scale-105' 
                  : 'text-slate-500 hover:text-slate-900 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
