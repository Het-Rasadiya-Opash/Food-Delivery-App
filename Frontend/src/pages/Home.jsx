import React from "react";
import AllRestaurants from "../components/AllRestaurants";
import { Search, MapPin, ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Craving something</span>{" "}
                  <span className="block text-orange-600 xl:inline">
                    delicious?
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover the best food and drinks in your area. Get them
                  delivered hot and fresh directly to your doorstep.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a
                      href="#restaurants"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-orange-600 hover:bg-orange-700 hover:-translate-y-0.5 transition-all duration-300 md:py-4 md:text-lg md:px-10 shadow-lg shadow-orange-500/30"
                    >
                      Order Now
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a
                      href="#restaurants"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors md:py-4 md:text-lg md:px-10"
                    >
                      Explore Menu
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full rounded-l-3xl shadow-2xl"
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
            alt="Delicious food platter"
          />
        </div>
      </div>

      <div id="restaurants">
        <AllRestaurants />
      </div>
    </div>
  );
};

export default Home;
