import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/product/${product.id}`)}
            className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100 cursor-pointer"
        >
            <div className="aspect-square w-full overflow-hidden bg-gray-200 group-hover:opacity-90 transition-opacity relative">
                <img
                    src={product.image_url || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="h-full w-full object-cover object-center"
                />
                {/* Quick Add Button */}

            </div>
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">
                            {product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{product.category || 'Clothing'}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">${product.price}</p>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
