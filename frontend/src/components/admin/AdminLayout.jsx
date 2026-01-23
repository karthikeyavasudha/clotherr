import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    LogOut,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';
import logo from '../../assets/logo.png';

const AdminLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin');
    };

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
        { path: '/admin/customers', icon: Users, label: 'Customers' },
    ];

    const NavItem = ({ item, mobile = false }) => (
        <NavLink
            to={item.path}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`
            }
        >
            <item.icon className="w-5 h-5" />
            <span className={`font-medium ${!sidebarOpen && !mobile ? 'hidden' : ''}`}>
                {item.label}
            </span>
            {location.pathname === item.path && (
                <ChevronRight className={`w-4 h-4 ml-auto ${!sidebarOpen && !mobile ? 'hidden' : ''}`} />
            )}
        </NavLink>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Clotherr" className="h-8 w-auto" />
                        {sidebarOpen && (
                            <span className="font-bold text-gray-900 text-lg">Admin</span>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavItem key={item.path} item={item} />
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-gray-200">
                    <div className={`flex items-center gap-3 mb-4 ${!sidebarOpen ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold">
                            {adminUser.full_name?.charAt(0) || adminUser.email?.charAt(0) || 'A'}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {adminUser.full_name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {adminUser.email}
                                </p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-2 w-full text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ${!sidebarOpen ? 'justify-center' : ''
                            }`}
                    >
                        <LogOut className="w-5 h-5" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="Clotherr" className="h-8 w-auto" />
                    <span className="font-bold text-gray-900">Admin</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
                    <div className="absolute right-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-bold text-gray-900 text-lg">Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <NavItem key={item.path} item={item} mobile />
                            ))}
                        </nav>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full mt-4 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 overflow-auto">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
