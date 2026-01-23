import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { COMPANY } from '../config/company';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSubmitted(true);
        setLoading(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Home
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions or need assistance? We're here to help! Reach out to us through any of the channels below.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Get in Touch</h2>

                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <Mail className="h-6 w-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Email</h3>
                                        <p className="text-gray-600">{COMPANY.supportEmail}</p>
                                        <p className="text-sm text-gray-500">For general inquiries</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <Mail className="h-6 w-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Orders</h3>
                                        <p className="text-gray-600">{COMPANY.ordersEmail}</p>
                                        <p className="text-sm text-gray-500">For order-related queries</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <Phone className="h-6 w-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Phone</h3>
                                        <p className="text-gray-600">{COMPANY.supportPhone}</p>
                                        <p className="text-sm text-gray-500">Customer support</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <Clock className="h-6 w-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Business Hours</h3>
                                        <p className="text-gray-600">Monday - Saturday</p>
                                        <p className="text-sm text-gray-500">10:00 AM - 7:00 PM IST</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-gray-100 p-3 rounded-lg">
                                        <MapPin className="h-6 w-6 text-gray-900" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Location</h3>
                                        {COMPANY.addressLines.map((line, idx) => (
                                            <p key={idx} className="text-gray-600">{line}</p>
                                        ))}
                                        <p className="text-sm text-gray-500">We ship across India</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-lg shadow-lg p-6 text-white">
                            <h3 className="font-bold text-lg mb-3">Response Time</h3>
                            <p className="text-gray-300 text-sm">
                                We typically respond to all inquiries within 24-48 hours during business days.
                                For urgent matters, please mention "URGENT" in your subject line.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                                    <p className="text-gray-600 mb-6">
                                        Thank you for reaching out. We'll get back to you within 24-48 hours.
                                    </p>
                                    <button
                                        onClick={() => setSubmitted(false)}
                                        className="text-gray-900 underline hover:no-underline"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Your Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Subject *
                                            </label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                            >
                                                <option value="">Select a subject</option>
                                                <option value="order">Order Inquiry</option>
                                                <option value="return">Return/Refund Request</option>
                                                <option value="product">Product Question</option>
                                                <option value="shipping">Shipping Information</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Message *
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows={6}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                                placeholder="Please describe your inquiry in detail..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400"
                                        >
                                            {loading ? (
                                                <span>Sending...</span>
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5" />
                                                    <span>Send Message</span>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">How can I track my order?</h3>
                            <p className="text-gray-600 text-sm">
                                Once your order is shipped, you will receive a tracking number via email.
                                You can also check your order status in your account under "Order History".
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">What is your return policy?</h3>
                            <p className="text-gray-600 text-sm">
                                We accept returns within 7 days of delivery for unused items with original tags intact.
                                Please visit our <Link to="/refund-policy" className="text-black underline">Refund Policy</Link> page for details.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">How long does delivery take?</h3>
                            <p className="text-gray-600 text-sm">
                                Standard delivery takes 5-7 business days across India. Metro cities may receive
                                orders within 3-5 business days.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 mb-2">Do you offer international shipping?</h3>
                            <p className="text-gray-600 text-sm">
                                Currently, we only ship within India. We're working on expanding our shipping
                                to international locations soon.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
