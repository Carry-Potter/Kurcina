import { API_ENDPOINTS } from '../apiConfig';

export const setTermini = (termini) => ({
    type: 'SET_TERMINI',
    payload: termini,
  });
  
  export const addTermin = (termin) => ({
    type: 'ADD_TERMIN',
    payload: termin,
  });
  
  export const fetchTermini = () => {
    return async (dispatch) => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token nije pronađen. Korisnik možda nije ulogovan.');
        return;
      }
  
      try {
        const response = await fetch(API_ENDPOINTS.ZAKAZANI_TERMINI_OD_DANAS, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Greška pri dobijanju termina');
        }
  
        const data = await response.json();
        console.log('Podaci o terminima:', data); // Dodajte ovo
        dispatch(setTermini(data));
      } catch (error) {
        console.error('Greška:', error);
      }
    };
  };