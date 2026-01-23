import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center mb-6">
                        <Shield className="h-8 w-8 text-gray-900 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">Last updated: December 21, 2024</p>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                            <p className="text-gray-600 mb-4">
                                Welcome to Clotherr ("we," "our," or "us"). We are committed to protecting your personal information
                                and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                                your information when you visit our website clotherr.online and make purchases from our online store.
                            </p>
                            <p className="text-gray-600">
                                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
                                please do not access the site.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Personal Information</h3>
                            <p className="text-gray-600 mb-4">We collect personal information that you voluntarily provide to us when you:</p>
                            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                                <li>Register on our website</li>
                                <li>Place an order</li>
                                <li>Subscribe to our newsletter</li>
                                <li>Contact us with inquiries</li>
                            </ul>
                            <p className="text-gray-600 mb-4">This information may include:</p>
                            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                                <li>Name and contact details (email address, phone number)</li>
                                <li>Billing and shipping address</li>
                                <li>Payment information (processed securely through payment gateways)</li>
                                <li>Order history and preferences</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2">Automatically Collected Information</h3>
                            <p className="text-gray-600">
                                When you visit our website, we automatically collect certain information about your device,
                                including information about your web browser, IP address, time zone, and some of the cookies
                                that are installed on your device.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Process and fulfill your orders</li>
                                <li>Communicate with you about your orders and provide customer support</li>
                                <li>Send you marketing communications (with your consent)</li>
                                <li>Improve our website and services</li>
                                <li>Prevent fraud and enhance security</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Sharing Your Information</h2>
                            <p className="text-gray-600 mb-4">We may share your information with:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li><strong>Service Providers:</strong> Third-party companies that help us operate our business (payment processors, shipping partners, email service providers)</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                            </ul>
                            <p className="text-gray-600 mt-4">
                                We do not sell, trade, or rent your personal identification information to third parties for marketing purposes.
                            </p>
                            <p className="text-gray-600 mt-4">
                                <strong>Payment Security:</strong> Payment information is processed securely by trusted third-party payment gateways such as Razorpay. We do not store your card or UPI details on our servers.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                            <p className="text-gray-600">
                                We implement appropriate technical and organizational security measures to protect your personal
                                information against unauthorized access, alteration, disclosure, or destruction. However, no method
                                of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee
                                absolute security.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
                            <p className="text-gray-600 mb-4">You have the right to:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Access the personal information we hold about you</li>
                                <li>Request correction of inaccurate information</li>
                                <li>Request deletion of your personal information</li>
                                <li>Opt-out of marketing communications</li>
                                <li>Withdraw consent where applicable</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
                            <p className="text-gray-600">
                                We use cookies and similar tracking technologies to track activity on our website and hold certain
                                information. Cookies are files with a small amount of data which may include an anonymous unique
                                identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is
                                being sent.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
                            <p className="text-gray-600">
                                We may update this privacy policy from time to time. We will notify you of any changes by posting
                                the new privacy policy on this page and updating the "Last updated" date. You are advised to review
                                this privacy policy periodically for any changes.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Us</h2>
                            <p className="text-gray-600">
                                If you have any questions about this Privacy Policy, please contact us at:
                            </p>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-800 font-medium">Clotherr</p>
                                <p className="text-gray-600">Email: support@clotherr.online</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
