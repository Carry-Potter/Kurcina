'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Gift, Clock, Tag } from 'lucide-react'
import API_ENDPOINTS from './apiConfig';

export default function PromotionBanner() {
  const [promotions, setPromotions] = useState([])

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PROMOTION)
        const data = await response.json()
        setPromotions(data)
      } catch (error) {
        console.error('Error fetching promotions:', error)
      }
    }

    fetchPromotions()
  }, [])

  if (promotions.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-[#d45757] to-[#e5b046] p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center justify-center">
        <Gift className="mr-3" size={28} />
        <span>Ekskluzivne promocije!</span>
      </h2>
      <div className="flex flex-wrap justify-center items-center">
        {promotions.map((promotion) => (
          <motion.div
            key={promotion._id}
            className="bg-white rounded-lg p-6 shadow-md transform transition duration-300 hover:scale-105 mx-2 my-4 w-full sm:w-8/12 md:w-5/12 lg:w-4/12 xl:w-3/12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{promotion.service}</h3>
            <div className="space-y-4">
              <p className="text-gray-600 flex items-center">
                <CalendarDays className="mr-2" size={24} />
                <span>
                  <strong>{promotion.requiredAppointments}</strong> zakazanih za{' '}
                  <strong>{promotion.freeAppointments}</strong> gratis!
                </span>
              </p>
              <p className="text-gray-600 flex items-center">
                <Clock className="mr-2" size={24} />
                <span>
                  {new Date(promotion.startDate).toLocaleDateString()} -{' '}
                  {new Date(promotion.endDate).toLocaleDateString()}
                </span>
              </p>
              <p className="text-gray-600 flex items-center">
                <Tag className="mr-2" size={24} />
                <span>Uštedite do 30%</span>
              </p>
            </div>
            <button
              className="mt-4 bg-orange-500 text-white py-3 px-6 rounded-md hover:bg-orange-600 transition duration-300 ease-in-out w-full"
              onClick={() => window.location.href = '#booking'}
            >
              Rezervišite odmah
            </button>
          </motion.div>
        ))}
      </div>
      <p className="text-white text-center mt-6">
        * Promocije važe samo za ograničen period. Uslovi se primenjuju.
      </p>
    </div>
  )
}
