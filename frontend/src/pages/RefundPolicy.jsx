import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <div className="flex items-center mb-6">
                        <RotateCcw className="h-8 w-8 text-gray-900 mr-3" />
                        <h1 className="text-3xl font-bold text-gray-900">Refund & Cancellation Policy</h1>
                    </div>

                    <p className="text-sm text-gray-500 mb-8">Last updated: December 21, 2024</p>

                    <div className="prose prose-gray max-w-none">
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Order Cancellation</h2>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Before Shipment</h3>
                            <p className="text-gray-600 mb-4">
                                You may cancel your order free of charge at any time before it has been shipped. To cancel your order:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                                <li>Contact us immediately via email at support@clotherr.online</li>
                                <li>Provide your order number and cancellation reason</li>
                                <li>We will confirm the cancellation within 24 hours</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2">After Shipment</h3>
                            <p className="text-gray-600">
                                Once an order has been shipped, it cannot be cancelled. However, you may refuse delivery or
                                return the item following our return policy below.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Return Policy</h2>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Eligibility for Returns</h3>
                            <p className="text-gray-600 mb-4">We accept returns within <strong>7 days</strong> from the date of delivery, provided:</p>
                            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                                <li>The item is unused, unwashed, and in its original condition</li>
                                <li>All original tags and packaging are intact</li>
                                <li>The item is not a final sale or non-returnable item</li>
                                <li>You have proof of purchase (order confirmation email)</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2">Non-Returnable Items</h3>
                            <p className="text-gray-600 mb-4">The following items cannot be returned:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Innerwear and undergarments (for hygiene reasons)</li>
                                <li>Items marked as "Final Sale" or "Non-Returnable"</li>
                                <li>Customized or personalized items</li>
                                <li>Items that have been worn, washed, or altered</li>
                                <li>Items without original tags and packaging</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How to Initiate a Return</h2>
                            <p className="text-gray-600 mb-4">To return an item, please follow these steps:</p>
                            <ol className="list-decimal list-inside text-gray-600 space-y-2">
                                <li>Email us at support@clotherr.online with your order number and reason for return</li>
                                <li>Wait for our team to approve the return request (within 48 hours)</li>
                                <li>Once approved, you will receive return shipping instructions</li>
                                <li>Pack the item securely in its original packaging</li>
                                <li>Ship the item to the address provided</li>
                            </ol>
                            <p className="text-gray-600 mt-4">
                                <strong>Note:</strong> Return shipping costs are the responsibility of the customer unless the
                                return is due to our error (wrong item shipped, defective product).
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Refund Process</h2>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Inspection and Approval</h3>
                            <p className="text-gray-600 mb-4">
                                Once we receive your returned item, our team will inspect it within 3-5 business days.
                                We will notify you of the approval or rejection of your refund.
                            </p>

                            <h3 className="text-lg font-medium text-gray-800 mb-2">Refund Timeline</h3>
                            <p className="text-gray-600 mb-4">If approved, your refund will be processed as follows:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li><strong>Original Payment Method:</strong> 5-10 business days for credit/debit card refunds</li>
                                <li><strong>Bank Transfer:</strong> 3-5 business days for direct bank transfers</li>
                                <li><strong>Store Credit:</strong> Immediate (if you choose store credit option)</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">Refund Amount</h3>
                            <p className="text-gray-600">
                                Refunds will be issued for the product cost only. Original shipping charges are non-refundable
                                unless the return is due to our error.
                            </p>
                            <p className="text-gray-600 mt-4">
                                <strong>Online Payments:</strong> Refunds for online payments will be processed back to the original payment method used during checkout.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Exchange Policy</h2>
                            <p className="text-gray-600 mb-4">
                                If you would like to exchange an item for a different size or color:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Exchanges are subject to product availability</li>
                                <li>Follow the same return process and request an exchange</li>
                                <li>If the new item has a price difference, you will be charged or refunded accordingly</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Damaged or Defective Items</h2>
                            <p className="text-gray-600 mb-4">
                                If you receive a damaged or defective item:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Contact us within 48 hours of delivery with photos of the damage</li>
                                <li>We will arrange for a free return pickup</li>
                                <li>You will receive a full refund or replacement at no additional cost</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Cash on Delivery (COD) Orders</h2>
                            <p className="text-gray-600">
                                For COD orders that are cancelled or returned, refunds will be processed via bank transfer.
                                Please provide your bank account details when initiating the return. Refunds for COD orders
                                may take 7-10 business days to process.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
                            <p className="text-gray-600">
                                For any questions regarding returns, refunds, or cancellations, please contact us:
                            </p>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-gray-800 font-medium">Clotherr Customer Support</p>
                                <p className="text-gray-600">Email: support@clotherr.online</p>
                                <p className="text-gray-600">Response time: Within 24-48 hours</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
