import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  CheckSquare, 
  Home, 
  ListTodo, 
  Calendar, 
  LogOut, 
  Bell, 
  Plus, 
  Check,
  Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/category.service';
import CategoriesModal from '../categories/CategoriesModal';

const AppShell = ({ children, onOpenAddTask, search, onSearchChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      if (res?.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories in AppShell:', err);
    }
  };

  useEffect(() => {
    fetchCategories();

    const handleCategoriesUpdate = () => {
      fetchCategories();
    };

    window.addEventListener('taskflow:categories-updated', handleCategoriesUpdate);
    return () => window.removeEventListener('taskflow:categories-updated', handleCategoriesUpdate);
  }, []);

  const handleCategoryCreated = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
    window.dispatchEvent(new CustomEvent('taskflow:categories-updated', { detail: newCat }));
  };

  const handleCategoryDeleted = (deletedId) => {
    setCategories((prev) => prev.filter((c) => c._id !== deletedId));
    window.dispatchEvent(new CustomEvent('taskflow:categories-updated', { detail: { deletedId } }));
  };

  const handleCategoryUpdated = (updatedCat) => {
    setCategories((prev) => prev.map((c) => (c._id === updatedCat._id ? updatedCat : c)));
    window.dispatchEvent(new CustomEvent('taskflow:categories-updated', { detail: updatedCat }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Today', path: '/today', icon: Home },
    { label: 'My Tasks', path: '/tasks', icon: ListTodo },
    { label: 'History', path: '/history', icon: Calendar },
  ];

  const getPageInfo = () => {
    if (location.pathname === '/today') {
      return { title: "Today's Tasks", subtitle: 'Focus on what matters most today' };
    }
    if (location.pathname === '/history') {
      return { title: 'History', subtitle: 'Review your past accomplishments' };
    }
    return { title: 'My Tasks', subtitle: 'Stay organized and productive' };
  };

  const { title, subtitle } = getPageInfo();

  const displayName = (user?.fullName || user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '') || (user?.email ? user.email.split('@')[0] : 'User')).trim();

  // Compute initials (e.g. "Sahil Maurya" -> "SM", "Sahil" -> "S")
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
    : `${nameParts[0]?.[0] || 'U'}`.toUpperCase();

  const diceBearAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=4f46e5&textColor=ffffff&fontSize=42&fontWeight=700`;

  return (
    <div className="flex min-h-screen bg-canvas font-sans">
      {/* Sidebar / Mobile Bottom Tab Bar */}
      <aside className="fixed bottom-0 left-0 right-0 h-16 w-full bg-surface border-t border-border z-40 flex flex-row items-center justify-around px-3 py-1.5 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] lg:relative lg:top-0 lg:h-screen lg:w-60 lg:flex-col lg:justify-between lg:border-r lg:border-t-0 lg:border-border lg:p-6 lg:shadow-none lg:z-0">
        {/* Top: Logo & Nav */}
        <div className="w-full flex lg:flex-col items-center">
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2.5 px-2 pb-8 w-full">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white shrink-0">
              <Check size={20} strokeWidth={3} />
            </div>
            <span className="text-lg font-extrabold text-ink tracking-tight">
              TaskFlow
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-row lg:flex-col justify-around lg:justify-start w-full gap-1 lg:gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-3.5 py-1.5 lg:py-2.5 rounded-chip text-[11.5px] lg:text-sm font-semibold transition ${
                    isActive
                      ? 'text-brand bg-brand-soft font-bold'
                      : 'text-muted hover:bg-gray-100/60'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {/* Mobile Categories Button */}
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="lg:hidden flex flex-col items-center gap-1 px-3.5 py-1.5 rounded-chip text-[11.5px] font-semibold text-muted hover:bg-gray-100/60 transition"
            >
              <Tag size={18} />
              <span>Categories</span>
            </button>
          </nav>

          {/* Desktop Categories Section in Left Bar */}
          <div className="hidden lg:flex flex-col w-full mt-6 pt-5 border-t border-border">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                Categories
              </span>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                title="Add Category"
                className="p-1 rounded-md text-muted hover:text-brand hover:bg-brand-soft transition"
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Quick list of top categories */}
            <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto pr-1">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-chip text-xs text-ink hover:bg-gray-100/70 transition text-left group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.textColor || '#4F46E5' }}
                    />
                    <span className="truncate font-medium">{cat.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* See & Add Categories Button */}
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 mt-2 px-2.5 py-2 w-full text-xs font-semibold text-brand hover:bg-brand-soft rounded-chip transition"
            >
              <Tag size={15} />
              <span>See / Add Categories</span>
            </button>
          </div>
        </div>

        {/* Bottom: Logout (Desktop only, mobile can use profile/logout) */}
        <div className="hidden lg:block w-full">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-chip text-sm font-medium text-danger hover:bg-danger-soft transition"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-6 overflow-x-hidden">

        {/* Top Header — always a single row */}
        <header className="px-4 pt-4 pb-3 lg:px-8 lg:pt-6 lg:pb-4 w-full max-w-5xl mx-auto">

          {/* Row 1: Title (left) + Controls (right) — never wraps */}
          <div className="flex items-center justify-between gap-3">

            {/* Left: Page Title */}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg lg:text-2xl font-extrabold text-ink tracking-tight leading-tight truncate">
                {title}
              </h1>
              <p className="text-xs text-muted mt-0.5 hidden lg:block truncate">
                {subtitle}
              </p>
            </div>

            {/* Right: Search (desktop only) + Add Task + Avatar */}
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">

              {/* Search — hidden on mobile, shown md+ */}
              {onSearchChange && (
                <input
                  type="text"
                  value={search || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search tasks..."
                  className="hidden lg:block w-56 xl:w-64 px-3.5 py-2 rounded-ctl border border-border-input bg-surface text-sm text-ink outline-none shadow-card focus:border-brand transition"
                />
              )}

              {/* Add Task Button */}
              {onOpenAddTask && (
                <button
                  type="button"
                  onClick={onOpenAddTask}
                  className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white px-3 py-2 lg:px-4 rounded-ctl font-semibold text-xs lg:text-sm shadow-cta transition shrink-0"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Add Task</span>
                </button>
              )}

              {/* Avatar + Name + Mobile Logout */}
              <div className="flex items-center gap-1.5 lg:gap-2.5 shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-brand text-white flex items-center justify-center font-bold text-xs shrink-0 border border-brand/20 shadow-xs">
                  <img
                    src={diceBearAvatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="text-[11px] font-bold">{initials}</span>
                </div>
                <span className="hidden lg:inline text-sm font-semibold text-ink whitespace-nowrap">
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Logout"
                  className="lg:hidden p-1.5 text-muted hover:text-danger rounded-md transition"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Search on mobile — full width below title row */}
          {onSearchChange && (
            <div className="lg:hidden mt-3">
              <input
                type="text"
                value={search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tasks..."
                className="w-full px-3.5 py-2 rounded-ctl border border-border-input bg-surface text-sm text-ink outline-none shadow-card focus:border-brand transition"
              />
            </div>
          )}
        </header>

        {/* Page Content — same max-width as header so right edges align */}
        <main className="px-4 pb-6 lg:px-8 lg:pb-8 flex-1 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Categories Management Modal */}
      <CategoriesModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCategoryCreated={handleCategoryCreated}
        onCategoryUpdated={handleCategoryUpdated}
        onCategoryDeleted={handleCategoryDeleted}
      />
    </div>
  );
};

export default AppShell;

