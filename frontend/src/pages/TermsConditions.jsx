import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center mb-6">
                        <FileText className="h-8 w-8 text-gray-900 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-900">Terms & Conditions</h1>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">Last updated: December 21, 2024</p>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Agreement to Terms</h2>
                            <p className="text-gray-600 mb-4">
                                By accessing and using the Clotherr website (clotherr.online), you agree to be bound by these
                                Terms and Conditions. If you disagree with any part of these terms, you may not access our website
                                or use our services.
                            </p>
                            <p className="text-gray-600">
                                These Terms and Conditions apply to all visitors, users, and customers of our website.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Use of Our Website</h2>
                            <p className="text-gray-600 mb-4">You agree to use our website only for lawful purposes and in a way that does not:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Infringe upon the rights of others</li>
                                <li>Restrict or inhibit anyone else's use of the website</li>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Transmit any harmful, offensive, or disruptive content</li>
                                <li>Attempt to gain unauthorized access to any part of our website</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
                            <p className="text-gray-600 mb-4">When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Maintaining the confidentiality of your account and password</li>
                                <li>Restricting access to your computer or device</li>
                                <li>All activities that occur under your account</li>
                            </ul>
                            <p className="text-gray-600 mt-4">
                                You must notify us immediately of any unauthorized use of your account or any other breach of security.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Products and Pricing</h2>
                            <p className="text-gray-600 mb-4">
                                We strive to display accurate product descriptions and pricing on our website. However, we reserve the right to:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Correct any errors, inaccuracies, or omissions</li>
                                <li>Change or update information at any time without prior notice</li>
                                <li>Cancel orders if pricing errors are discovered</li>
                            </ul>
                            <p className="text-gray-600 mt-4">
                                All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Orders and Payment</h2>
                            <p className="text-gray-600 mb-4">
                                By placing an order, you are making an offer to purchase products. We reserve the right to accept or
                                decline your order for any reason, including but not limited to:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Product availability</li>
                                <li>Errors in product or pricing information</li>
                                <li>Suspected fraudulent transactions</li>
                            </ul>
                            <p className="text-gray-600 mt-4">
                                Payment must be made at the time of order through our accepted payment methods. We currently accept
                                Cash on Delivery (COD) and online payment options.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Shipping and Delivery</h2>
                            <p className="text-gray-600 mb-4">
                                We will make every effort to deliver your order within the estimated timeframe. However, delivery
                                times are estimates and not guaranteed. We are not liable for any delays caused by:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Incorrect shipping information provided by you</li>
                                <li>Circumstances beyond our control (weather, strikes, etc.)</li>
                                <li>Customs delays for international orders</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
                            <p className="text-gray-600">
                                All content on this website, including but not limited to text, graphics, logos, images, and software,
                                is the property of Clotherr and is protected by copyright and other intellectual property laws.
                                You may not reproduce, distribute, modify, or create derivative works without our express written permission.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
                            <p className="text-gray-600">
                                To the fullest extent permitted by law, Clotherr shall not be liable for any indirect, incidental,
                                special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred
                                directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting
                                from your use of our website or services.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Indemnification</h2>
                            <p className="text-gray-600">
                                You agree to indemnify, defend, and hold harmless Clotherr and its officers, directors, employees,
                                and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising
                                from your use of our website or violation of these Terms and Conditions.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Governing Law</h2>
                            <p className="text-gray-600">
                                These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
                                Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts
                                in India.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
                            <p className="text-gray-600">
                                We reserve the right to modify these Terms and Conditions at any time. Changes will be effective
                                immediately upon posting on this page. Your continued use of our website after any changes
                                constitutes your acceptance of the new Terms and Conditions.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
                            <p className="text-gray-600">
                                If you have any questions about these Terms and Conditions, please contact us at:
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

export default TermsConditions;
