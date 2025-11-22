import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="relative bg-gray-50 h-[80vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6">
                        Redefine Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">Style Statement</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto md:mx-0">
                        Discover the latest trends in fashion with our premium collection.
                        Quality comfort meets modern design.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                        <Link to="/shop" className="inline-flex items-center justify-center px-8 py-4 bg-black text-white text-lg font-medium rounded-full hover:bg-gray-800 transition-all transform hover:scale-105">
                            Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Categories Preview */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Trending Now</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="group relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden cursor-pointer">
                                <div className="absolute inset-0 bg-gray-200 group-hover:bg-gray-300 transition-colors"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                                    <h3 className="text-white text-xl font-semibold">Summer Collection</h3>
                                    <p className="text-white/80">View Details</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
