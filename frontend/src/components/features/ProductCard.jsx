import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

    // Calculate discount percentage
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.compare_at_price) * 100)
        : 0;

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            className={`group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 cursor-pointer ${isOutOfStock ? 'opacity-75' : ''}`}
        >
            <div className="aspect-square w-full overflow-hidden bg-gray-200 group-hover:opacity-90 transition-opacity relative">
                <img
                    src={product.image_url || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className={`h-full w-full object-cover object-center ${isOutOfStock ? 'grayscale' : ''}`}
                />
                {/* Sale Badge */}
                {hasDiscount && !isOutOfStock && (
                    <div className="absolute top-2 left-2">
                        <span className="px-2 py-1 bg-red-500 text-white font-bold rounded text-xs">
                            -{discountPercent}%
                        </span>
                    </div>
                )}
                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-full text-sm">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{product.category || 'Clothing'}</p>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                            {hasDiscount && (
                                <p className="text-sm text-gray-400 line-through">₹{product.compare_at_price}</p>
                            )}
                            <p className={`text-sm font-bold ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                                ₹{product.price}
                            </p>
                        </div>
                        {isLowStock && (
                            <p className="text-xs text-orange-600 font-medium">Only {product.stock} left</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
