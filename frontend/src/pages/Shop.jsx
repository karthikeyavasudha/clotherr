import React, { useEffect, useState, useMemo } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/features/ProductCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['All', 'Men', 'Women', 'Kids', 'Unisex'];
const PRICE_RANGES = [
    { label: 'All Prices', min: 0, max: Infinity },
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹1000', min: 500, max: 1000 },
    { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { label: 'Over ₹2000', min: 2000, max: Infinity }
];

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPriceRange, setSelectedPriceRange] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const category = selectedCategory === 'All' ? null : selectedCategory;
                const data = await fetchProducts(category);
                setProducts(data);
            } catch (err) {
                setError('Failed to load products. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, [selectedCategory]);

    // Filter products by search and price
    const filteredProducts = useMemo(() => {
        let result = products;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(product =>
                product.name?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query)
            );
        }

        // Price filter
        const priceRange = PRICE_RANGES[selectedPriceRange];
        if (priceRange.max !== Infinity || priceRange.min !== 0) {
            result = result.filter(product =>
                product.price >= priceRange.min && product.price < priceRange.max
            );
        }

        return result;
    }, [products, searchQuery, selectedPriceRange]);

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('All');
        setSelectedPriceRange(0);
    };

    const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedPriceRange !== 0;

    return (
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col gap-6 mb-8">
                <div className="flex justify-between items-end">
                    <h1 className="text-3xl font-bold text-gray-900">Shop All</h1>
                    <span className="text-gray-500">{filteredProducts.length} Products</span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Filter Toggle for Mobile */}
                <div className="flex items-center justify-between lg:hidden">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && <span className="w-2 h-2 bg-black rounded-full"></span>}
                    </button>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-sm text-gray-600 underline">
                            Clear all
                        </button>
                    )}
                </div>

                {/* Filters Section */}
                <div className={`flex flex-col lg:flex-row gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
                    {/* Category Filter */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div className="lg:w-64">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                        <select
                            value={selectedPriceRange}
                            onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white cursor-pointer"
                        >
                            {PRICE_RANGES.map((range, index) => (
                                <option key={index} value={index}>
                                    {range.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="hidden lg:flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Active filters:</span>
                        {searchQuery && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                                Search: "{searchQuery}"
                                <button onClick={() => setSearchQuery('')}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {selectedCategory !== 'All' && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                                {selectedCategory}
                                <button onClick={() => setSelectedCategory('All')}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {selectedPriceRange !== 0 && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full flex items-center gap-1">
                                {PRICE_RANGES[selectedPriceRange].label}
                                <button onClick={() => setSelectedPriceRange(0)}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        <button onClick={clearFilters} className="text-gray-600 underline ml-2">
                            Clear all
                        </button>
                    </div>
                )}
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-red-500">{error}</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            {!loading && filteredProducts.length === 0 && !error && (
                <div className="text-center py-20">
                    <p className="text-gray-500 mb-4">
                        No products found matching your filters
                    </p>
                    <button
                        onClick={clearFilters}
                        className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Shop;
