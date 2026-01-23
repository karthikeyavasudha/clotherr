import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await fetchProductById(id);
                setProduct(data);
            } catch (error) {
                console.error('Failed to load product:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart({ ...product, size: selectedSize, quantity });
            navigate('/shop');
        }
    };

    // Get all images (primary + additional)
    const getAllImages = () => {
        if (!product) return [];
        const allImages = [];
        if (product.image_url) allImages.push(product.image_url);
        if (product.images && Array.isArray(product.images)) {
            allImages.push(...product.images);
        }
        return allImages;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                    <button onClick={() => navigate('/shop')} className="text-primary hover:underline">
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/shop')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Shop
                </button>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        {/* Product Images Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={getAllImages()[selectedImage] || product.image_url || 'https://via.placeholder.com/400'}
                                    alt={product.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Thumbnail Gallery */}
                            {getAllImages().length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {getAllImages().map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                                ? 'border-black'
                                                : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col">
                            <div className="mb-4">
                                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                                    {product.category}
                                </span>
                                <h1 className="text-4xl font-bold text-gray-900 mt-2">{product.name}</h1>
                            </div>

                            <div className="text-3xl font-bold text-gray-900 mb-6">
                                ₹{product.price.toFixed(2)}
                            </div>

                            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

                            {/* Size Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Select Size
                                </label>
                                <div className="flex gap-3">
                                    {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${selectedSize === size
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity Selection */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={product.stock === 0}
                                        className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        −
                                    </button>
                                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        disabled={product.stock === 0 || quantity >= product.stock}
                                        className="w-10 h-10 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        +
                                    </button>
                                </div>
                                {/* Stock Status */}
                                {product.stock === 0 ? (
                                    <p className="text-sm text-red-600 font-medium mt-2">Out of Stock</p>
                                ) : product.stock <= 5 ? (
                                    <p className="text-sm text-orange-600 font-medium mt-2">⚠️ Only {product.stock} left in stock - order soon!</p>
                                ) : (
                                    <p className="text-sm text-green-600 mt-2">✓ {product.stock} items in stock</p>
                                )}
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="w-full bg-black text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>

                            {/* Product Details */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                                <ul className="space-y-2 text-gray-600">
                                    <li>• Premium quality materials</li>
                                    <li>• Comfortable fit</li>
                                    <li>• Easy care instructions</li>
                                    <li>• Free shipping on orders over ₹100</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
