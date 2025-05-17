import React from "react";
import { Link } from "react-router-dom";
import {
  FaYoutube,
  FaGlobe,
  FaShieldAlt,
  FaInfoCircle,
  FaCopyright,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 text-sm">
      <div className="container mx-auto px-4">
        {/* Top section with logo and links */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <FaYoutube className="text-primary-color text-2xl mr-1" />
              <span className="font-bold">ChaiTube</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10">
            {/* First column */}
            <div>
              <h3 className="font-medium mb-2 text-gray-900">About</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    About ChaiTube
                  </Link>
                </li>
                <li>
                  <Link
                    to="/press"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Press
                  </Link>
                </li>
                <li>
                  <Link
                    to="/copyright"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Copyright
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/creators"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Creators
                  </Link>
                </li>
              </ul>
            </div>

            {/* Second column */}
            <div>
              <h3 className="font-medium mb-2 text-gray-900">Features</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/premium"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ChaiTube Premium
                  </Link>
                </li>
                <li>
                  <Link
                    to="/music"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ChaiTube Music
                  </Link>
                </li>
                <li>
                  <Link
                    to="/kids"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ChaiTube Kids
                  </Link>
                </li>
                <li>
                  <Link
                    to="/artists"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ChaiTube for Artists
                  </Link>
                </li>
              </ul>
            </div>

            {/* Third column */}
            <div>
              <h3 className="font-medium mb-2 text-gray-900">Policies</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/terms"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/guidelines"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link
                    to="/safety"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Safety Center
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section with copyright and language */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-200 text-gray-600">
          <div className="flex items-center mb-2 sm:mb-0">
            <FaCopyright className="mr-1" />
            <span>{new Date().getFullYear()} ChaiTube</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaGlobe className="mr-1" />
              <select className="bg-transparent border-none text-gray-600 focus:outline-none">
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="flex items-center">
              <FaShieldAlt className="mr-1" />
              <span>Restricted Mode: Off</span>
            </div>

            <Link to="/help" className="flex items-center">
              <FaInfoCircle className="mr-1" />
              <span>Help</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
