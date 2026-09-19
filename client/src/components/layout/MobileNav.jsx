import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bot, Library, Settings } from 'lucide-react';

export const MobileNav = () => {
  const linkClass = ({ isActive }) =>
    `flex flex-col items-center justify-center py-2 px-2 text-[10px] font-medium transition-colors ${
      isActive ? 'text-linova-primary' : 'text-gray-400 hover:text-gray-200'
    }`;

  return (
    <nav className="md:hidden glass-panel border-t border-white/10 flex items-center justify-around fixed bottom-0 left-0 right-0 z-30 pb-safe min-h-[3.75rem]">
      <NavLink to="/" className={linkClass}>
        <Home className="w-5 h-5 mb-1" />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className={linkClass}>
        <Search className="w-5 h-5 mb-1" />
        <span>Search</span>
      </NavLink>
      {/* AI DJ - on desktop this lives in TopBar (hidden below the lg breakpoint),
          so phones had no way to reach it at all. This is the fix. */}
      <NavLink to="/ai" className={linkClass}>
        <Bot className="w-5 h-5 mb-1" />
        <span>AI DJ</span>
      </NavLink>
      <NavLink to="/library" className={linkClass}>
        <Library className="w-5 h-5 mb-1" />
        <span>Library</span>
      </NavLink>
      <NavLink to="/settings" className={linkClass}>
        <Settings className="w-5 h-5 mb-1" />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
};
