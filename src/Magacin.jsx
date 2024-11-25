import React, { useState, useEffect } from 'react';
import API_ENDPOINTS from './apiConfig';

const Magacin = () => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ code: '', name: '', quantity: 0 });
  const [editItem, setEditItem] = useState(null); // Za uređivanje stavke

  useEffect(() => {
    const fetchItems = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.MAGACIN, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setItems(data);
    };

    fetchItems();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const response = await fetch(API_ENDPOINTS.MAGACIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newItem),
    });

    if (response.ok) {
      const createdItem = await response.json();
      setItems((prev) => [...prev, createdItem]);
      setNewItem({ code: '', name: '', quantity: 0 }); // Reset form
    } else {
      console.error('Greška pri dodavanju stavke:', response.statusText);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setNewItem({ code: item.code, name: item.name, quantity: item.quantity }); // Postavi vrednosti za uređivanje
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_ENDPOINTS.MAGACIN}/${editItem._id}`, { // Pretpostavljamo da imate ID stavke
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newItem),
    });

    if (response.ok) {
      const updatedItem = await response.json();
      setItems((prev) => prev.map(item => (item._id === updatedItem._id ? updatedItem : item)));
      setEditItem(null); // Resetuj uređivanje
      setNewItem({ code: '', name: '', quantity: 0 }); // Reset form
    } else {
      console.error('Greška pri ažuriranju stavke:', response.statusText);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_ENDPOINTS.MAGACIN}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setItems((prev) => prev.filter(item => item._id !== id)); // Ukloni stavku iz stanja
    } else {
      console.error('Greška pri brisanju stavke:', response.statusText);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Magacin</h1>
      <form onSubmit={editItem ? handleUpdate : handleSubmit} className="mb-8">
        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700">Šifra</label>
          <input
            type="text"
            name="code"
            value={newItem.code}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700">Naziv</label>
          <input
            type="text"
            name="name"
            value={newItem.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>
        <div className="flex flex-col mb-4">
          <label className="text-sm font-medium text-gray-700">Količina</label>
          <input
            type="number"
            name="quantity"
            value={newItem.quantity}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
          />
        </div>
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          {editItem ? 'Ažuriraj stavku' : 'Dodaj stavku'}
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Stavke u magacinu</h2>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">Šifra</th>
            <th className="py-2 px-4 border-b">Naziv</th>
            <th className="py-2 px-4 border-b">Količina</th>
            <th className="py-2 px-4 border-b">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.code} className="hover:bg-gray-100 text-center">
              <td className="py-2 px-4 border-b">{item.code}</td>
              <td className="py-2 px-4 border-b">{item.name}</td>
              <td className="py-2 px-4 border-b">{item.quantity}</td>
              <td className="py-2 px-4 border-b">
                <button onClick={() => handleEdit(item)} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded">
                  Izmeni
                </button>
                <button onClick={() => handleDelete(item._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded ml-2">
                  Obriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Magacin;