const API_BASE_URL = 'http://localhost:5000/api'; 

const API_ENDPOINTS = {
  
  INITIAL_DATA: `${API_BASE_URL}/`,
  LOGIN: `${API_BASE_URL}/login`,
  REGISTER: `${API_BASE_URL}/register`,
  RESET_PASSWORD: `${API_BASE_URL}/reset-password`, // Ova linija treba da bude ispravna
  CHANGE_PASSWORD: `${API_BASE_URL}/change-password`,
  ALL_USERS: `${API_BASE_URL}/all-users`,
  WORKING_HOURS: `${API_BASE_URL}/working-hours`,
  SERVICES: `${API_BASE_URL}/services`,
  TERMINI: `${API_BASE_URL}/termini`,
  PROMOTION_USERS: `${API_BASE_URL}/promotion-users`,
  
  ZAUZETI_TERMINI: `${API_BASE_URL}/zauzeti-termini`,
  ZAKAZANI_TERMINI_PO_MESECIMA: `${API_BASE_URL}/zakazani-termini-po-mesecima`,
   MAGACIN: `${API_BASE_URL}/magacin`,
  ZAKAZANI_TERMINI_OD_DANAS: `${API_BASE_URL}/termini-od-danas`,
  PROMOTION: `${API_BASE_URL}/promotions`,
  UPDATE_USER: `${API_BASE_URL}/update-user`,
  UPDATE_PROMOTION: `${API_BASE_URL}/update-promotion`,
  DELETE_PROMOTION: `${API_BASE_URL}/delete-promotion`,
  DELETE_USER: `${API_BASE_URL}/delete-user`,
  DELETE_SERVICE: `${API_BASE_URL}/delete-service`,
  PROSECNO_VREME_TERMINA: `${API_BASE_URL}/prosecno-vreme-termina`,
  NAJ_POPULARNIJE_USLUGE: `${API_BASE_URL}/najpopularnije-usluge`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google`,
  
  
UKUPNA_ZARADA: `${API_BASE_URL}/ukupna-zarada-po-mesecima`, 
  // Dodajte ostale rute ovde
};

export default API_ENDPOINTS;