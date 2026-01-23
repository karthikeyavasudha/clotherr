import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import { COMPANY } from '../config/company';

const ShippingPolicy = () => {
    const lastUpdated = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center mb-6">
                        <Truck className="h-8 w-8 text-gray-900 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-900">Shipping & Delivery Policy</h1>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">Last updated: {lastUpdated}</p>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Shipping Coverage</h2>
                            <p className="text-gray-600">
                                We currently ship within India. International shipping is not available at this time.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Order Processing</h2>
                            <p className="text-gray-600">
                                Orders are typically processed within 1-2 business days (excluding Sundays and public holidays).
                                You will receive an order confirmation once your order is placed, and a shipment confirmation once it ships.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Delivery Timelines</h2>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Metro cities: 3-5 business days</li>
                                <li>Other locations: 5-7 business days</li>
                            </ul>
                            <p className="text-gray-600 mt-4">
                                Delivery timelines are estimates and may vary due to courier delays, weather, strikes, or circumstances beyond our control.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Shipping Charges</h2>
                            <p className="text-gray-600">
                                Shipping charges (if any) are shown at checkout before you complete payment.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Tracking</h2>
                            <p className="text-gray-600">
                                If tracking is available for your shipment, we will share the tracking details via email after dispatch.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Address Changes</h2>
                            <p className="text-gray-600">
                                Address changes are possible only before the order is shipped. Please contact us as soon as possible if you need to update your address.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
                            <p className="text-gray-600">For shipping-related queries, contact us:</p>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-800 font-medium">{COMPANY.legalName}</p>
                                <p className="text-gray-600">Email: {COMPANY.supportEmail}</p>
                                <p className="text-gray-600">Phone: {COMPANY.supportPhone}</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicy;
