import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiBriefcase, HiUser, HiLogout, HiMenu, HiX,
  HiChevronDown, HiViewGrid, HiBookmark, HiClipboardList,
  HiPlusCircle, HiShieldCheck,
} from 'react-icons/hi';

const Avatar = ({ user }) => (
  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ring-2 ring-white shadow-md">
    {user?.avatar
      ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
      : user?.name?.charAt(0).toUpperCase()
    }
  </div>
);

export default function Navbar() {
  const { isLoggedIn, user, logout, isJobseeker, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdown(false);
    setMenuOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${isActive ? 'text-primary-600' : 'text-slate-600 hover:text-slate-900'}`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-blue-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <HiBriefcase className="text-white text-lg" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900">
              Talent<span className="text-gradient">Bridge</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/jobs" className={navLinkClass}>Browse Jobs</NavLink>
            {isRecruiter && <NavLink to="/dashboard" className={navLinkClass}>Dashboard</NavLink>}
            {isAdmin     && <NavLink to="/admin"     className={navLinkClass}>Admin Panel</NavLink>}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link to="/login"    className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            ) : (
              <div className="relative" ref={dropRef}>
                <button
                  onClick={() => setDropdown(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Avatar user={user} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name?.split(' ')[0]}</p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  <HiChevronDown className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 card py-2 animate-scale-in">
                    {isJobseeker && <>
                      <DropItem to="/profile"       icon={<HiUser />}         label="My Profile"        onClick={() => setDropdown(false)} />
                      <DropItem to="/applied-jobs"  icon={<HiClipboardList />} label="Applied Jobs"     onClick={() => setDropdown(false)} />
                      <DropItem to="/bookmarks"     icon={<HiBookmark />}     label="Saved Jobs"        onClick={() => setDropdown(false)} />
                    </>}
                    {isRecruiter && <>
                      <DropItem to="/profile"   icon={<HiUser />}       label="My Profile"   onClick={() => setDropdown(false)} />
                      <DropItem to="/dashboard" icon={<HiViewGrid />}   label="Dashboard"    onClick={() => setDropdown(false)} />
                      <DropItem to="/post-job"  icon={<HiPlusCircle />} label="Post a Job"   onClick={() => setDropdown(false)} />
                    </>}
                    {isAdmin && <>
                      <DropItem to="/admin"   icon={<HiShieldCheck />} label="Admin Panel" onClick={() => setDropdown(false)} />
                      <DropItem to="/profile" icon={<HiUser />}        label="Profile"     onClick={() => setDropdown(false)} />
                    </>}
                    <div className="my-1 border-t border-slate-100 mx-3" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <HiLogout className="text-lg" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-xl hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <HiX className="text-xl" /> : <HiMenu className="text-xl" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-100 animate-slide-up">
            <div className="flex flex-col gap-1">
              <MobileLink to="/jobs" onClick={() => setMenuOpen(false)}>Browse Jobs</MobileLink>
              {isLoggedIn && <>
                <MobileLink to="/profile" onClick={() => setMenuOpen(false)}>My Profile</MobileLink>
                {isJobseeker && <>
                  <MobileLink to="/applied-jobs" onClick={() => setMenuOpen(false)}>Applied Jobs</MobileLink>
                  <MobileLink to="/bookmarks"    onClick={() => setMenuOpen(false)}>Saved Jobs</MobileLink>
                </>}
                {isRecruiter && <>
                  <MobileLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
                  <MobileLink to="/post-job"  onClick={() => setMenuOpen(false)}>Post a Job</MobileLink>
                </>}
                {isAdmin && <MobileLink to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</MobileLink>}
                <button onClick={handleLogout} className="text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl">
                  Sign Out
                </button>
              </>}
              {!isLoggedIn && <>
                <MobileLink to="/login"    onClick={() => setMenuOpen(false)}>Sign In</MobileLink>
                <MobileLink to="/register" onClick={() => setMenuOpen(false)}>Get Started</MobileLink>
              </>}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

const DropItem = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick}
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
    <span className="text-slate-400 text-base">{icon}</span>
    {label}
  </Link>
);

const MobileLink = ({ to, children, onClick }) => (
  <Link to={to} onClick={onClick}
    className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
    {children}
  </Link>
);
