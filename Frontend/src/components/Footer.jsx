import React from "react";

const Footer = () => {
  return (
    <div>
      <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Food App
              </h2>
              <p className="mt-2 text-sm text-gray-400 max-w-xs">
                Delivering your favorite meals hot and fresh, right to your
                doorstep.
              </p>
            </div>
            <div className="flex gap-6 text-sm font-medium">
              <a href="#" className="hover:text-orange-500 transition-colors">
                About
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Contact
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-orange-500 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Food App. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
