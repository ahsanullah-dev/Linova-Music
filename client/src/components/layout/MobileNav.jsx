import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, ArrowDownToLine, Settings } from 'lucide-react';

export const MobileNav = () => {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-2 px-3 text-[11px] font-medium transition-colors ${
      isActive ? 'text-linova-primary' : 'text-gray-400 hover:text-gray-200'
    }`;

  return (
    <nav className="md:hidden glass-panel border-t border-white/10 flex items-center justify-around fixed bottom-0 left-0 right-0 z-30 pb-safe">
      <NavLink to="/" className={linkClass}>
        <Home className="w-5 h-5 mb-1" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className={linkClass}>
        <Search className="w-5 h-5 mb-1" />
        <span>Search</span>
      </NavLink>
      <NavLink to="/library" className={linkClass}>
        <Library className="w-5 h-5 mb-1" />
        <span>Library</span>
      </NavLink>
      <NavLink to="/library?tab=downloaded" className={linkClass}>
        <ArrowDownToLine className="w-5 h-5 mb-1" />
        <span>Offline</span>
      </NavLink>
      <NavLink to="/settings" className={linkClass}>
        <Settings className="w-5 h-5 mb-1" />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
};
