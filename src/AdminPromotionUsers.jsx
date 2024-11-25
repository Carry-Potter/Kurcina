import React, { useEffect, useState } from 'react'
import { Users, Gift, Award } from 'lucide-react'
import API_ENDPOINTS from './apiConfig';

const PromotionUsers = () => {
  const [promotionUsers, setPromotionUsers] = useState([]);
  const [freeUsers, setFreeUsers] = useState([]);

  useEffect(() => {
    const fetchPromotionUsers = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.PROMOTION_USERS, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      console.log('API odgovor:', data); // Log API odgovor

      // Proverite da li data sadrži validne korisnike
      if (!Array.isArray(data)) {
        console.error('Podaci nisu u ispravnom formatu:', data);
        return;
      }

      setPromotionUsers(data);

      // Filtriranje korisnika koji ispunjavaju uslov za besplatnu uslugu
      const eligibleFreeUsers = data.filter(user => user.count % 4 === 0);
      setFreeUsers(eligibleFreeUsers);
    };

    fetchPromotionUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
    <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Promocija Korisnika</h1>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-6 w-6 text-blue-500" />
          Korisnici u promociji
        </div>
        <div className="text-sm text-gray-500 mb-4">Lista korisnika koji učestvuju u promociji</div>
        {promotionUsers.map((user, index) => (
          <React.Fragment key={user.email}>
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium text-gray-700">{user.email}</p>
                <p className="text-sm text-gray-500">{user.service}</p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="h-6 w-6 text-green-500" />
          Korisnici sa besplatnom uslugom
        </div>
        <div className="text-sm text-gray-500 mb-4">Lista korisnika koji su ostvarili pravo na besplatnu uslugu</div>
        {freeUsers.map((user, index) => (
          <React.Fragment key={user.email}>
            <div className="flex justify-between items-center py-3">
              <div>
                <p className="font-medium text-gray-700">{user.email}</p>
                <p className="text-sm text-gray-500">{user.service}</p>
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
)
}

export default PromotionUsers;