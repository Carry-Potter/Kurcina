import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Uverite se da imate ikone za meni

const Navbar = ({ user, setUser }) => {
  const [isOpen, setIsOpen] = useState(false); // Stanje za otvoreni/zatvoreni meni
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <span className="font-bold text-xl text-primary">Salon Tanja</span>
          </div>
          <div className="hidden sm:flex sm:space-x-8">
            <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              Početna
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  {user.firstName}
                </Link>
                <button onClick={handleLogout} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Odjavi se
                </button>
                {user.firstName === 'admin' && (
                  <>
                    <Link to="/pregled-termina" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Pregled Termina
                    </Link>
                    <Link to="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Admin Stranica
                    </Link>
                  </>
                )}
              </>
            ) : (
              <Link to="/login" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Prijava
              </Link>
            )}
          </div>
          {/* Mobilni meni */}
          <div className="sm:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobilni meni sadržaj */}
      {isOpen && (
        <div className="sm:hidden bg-white shadow-md">
          <div className="px-4 py-2">
            <Link to="/" className="block text-gray-500 hover:text-gray-700 py-2">Početna</Link>
            {user ? (
              <>
                <Link to="/profile" className="block text-gray-500 hover:text-gray-700 py-2">{user.firstName}</Link>
                <button onClick={handleLogout} className="block text-gray-500 hover:text-gray-700 py-2">Odjavi se</button>
                {user.firstName === 'admin' && (
                  <>
                    <Link to="/pregled-termina" className="block text-gray-500 hover:text-gray-700 py-2">Pregled Termina</Link>
                    <Link to="/admin" className="block text-gray-500 hover:text-gray-700 py-2">Admin Stranica</Link>
                  </>
                )}
              </>
            ) : (
              <Link to="/login" className="block text-gray-500 hover:text-gray-700 py-2">Prijava</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
