import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1">
                        <Link to="/" className="text-2xl font-bold">CLOTHERR</Link>
                        <p className="mt-4 text-gray-400 text-sm">
                            Your destination for quality fashion. Shop the latest trends
                            for men, women, and kids.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/shop" className="text-gray-400 hover:text-white transition-colors">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop?category=Men" className="text-gray-400 hover:text-white transition-colors">
                                    Men
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop?category=Women" className="text-gray-400 hover:text-white transition-colors">
                                    Women
                                </Link>
                            </li>
                            <li>
                                <Link to="/shop?category=Kids" className="text-gray-400 hover:text-white transition-colors">
                                    Kids
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Customer Service</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-gray-400 hover:text-white transition-colors">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
                                    Returns & Refunds
                                </Link>
                            </li>
                            <li>
                                <Link to="/shipping-policy" className="text-gray-400 hover:text-white transition-colors">
                                    Shipping & Delivery
                                </Link>
                            </li>
                            <li>
                                <Link to="/account" className="text-gray-400 hover:text-white transition-colors">
                                    My Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-conditions" className="text-gray-400 hover:text-white transition-colors">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
                                    Refund & Cancellation Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © {currentYear} Clotherr. All rights reserved.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Privacy
                            </Link>
                            <Link to="/terms-conditions" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Terms
                            </Link>
                            <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;