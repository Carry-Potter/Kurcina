import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import API_ENDPOINTS from './apiConfig';

const AllUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // Broj korisnika po stranici

  useEffect(() => {
    const fetchAllUsers = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ALL_USERS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      console.log('API odgovor za sve korisnike:', data); // Log API odgovor

      // Proverite da li data sadrži validne korisnike
      if (!Array.isArray(data)) {
        console.error('Podaci nisu u ispravnom formatu:', data);
        return;
      }

      setAllUsers(data);
    };

    fetchAllUsers();
  }, []);

  // Izračunavanje korisnika za trenutnu stranicu
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = allUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Funkcija za promenu stranice
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Broj stranica
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(allUsers.length / usersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Svi Korisnici</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 px-4 border-b">Ime</th>
              <th className="py-2 px-4 border-b">Prezime</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Telefon</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.email} className="hover:bg-gray-100 text-center">
                <td className="py-2 px-4 border-b">{user.firstName}</td>
                <td className="py-2 px-4 border-b">{user.lastName}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginacija */}
      <div className="flex justify-center mt-4">
        <nav>
          <ul className="flex space-x-2">
            {pageNumbers.map(number => (
              <li key={number}>
                <button
                  onClick={() => paginate(number)}
                  className={`px-4 py-2 border rounded-md ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {number}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AllUsers;