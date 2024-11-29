import { Link } from 'react-router-dom';
import React, { useState,useContext, useEffect } from 'react'
import { Scissors, Droplet, Wind, Calendar, Clock, Star, MapPin, Phone, Mail, Instagram, Facebook, Twitter,User  } from 'lucide-react'
import Pozadina from './slike-tanja-salon/pexels-orlovamaria-4969838.jpg'

import PromotionBanner from './PromotionBanner';
import API_ENDPOINTS from './apiConfig';
import DatePicker from 'react-datepicker'; // {{ edit_1 }}
import 'react-datepicker/dist/react-datepicker.css';
import { TerminiContext } from './TerminiContext';
import BookingForm from './BookingForm';


export default function LandingPage() {

  const [gender, setGender] = useState('Muškarac'); // Dodajte stanje za pol
  const [services, setServices] = useState([]); // Stanje za usluge
  const [selectedServices, setSelectedServices] = useState([]);
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [date, setDate] = useState(null); // Postavite na null
  const [time, setTime] = useState('');
  const [service, setService] = useState('')
  const [zauzetiTermini, setZauzetiTermini] = useState([]);
 
  const [currentImageIndex, setCurrentImageIndex] = useState(null); // Koristimo null da označimo da nijedna slika nije izabrana
  const [user, setUser] = useState(null);
  const [workingHours, setWorkingHours] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const { setTermini } = useContext(TerminiContext);
  useEffect(() => {
    const fetchWorkingHours = async () => {
      const response = await fetch(API_ENDPOINTS.WORKING_HOURS, {
        method: 'GET',
      });
      const data = await response.json();
      setWorkingHours(data);
    };

    fetchWorkingHours();
  }, []);


 
  

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const userParam = queryParams.get('user');
    if (userParam) {
      const user = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem('user', JSON.stringify(user)); // Sačuvajte korisničke podatke
      setUser(user); // Postavite korisnika u stanje
    }
  }, []);
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (loggedUser) {
      setUser(loggedUser);
      setEmail(loggedUser.email);
      setName(loggedUser.firstName);
      setPhone(loggedUser.phone);
    }
  }, []);

  
  // Učitajte radno vreme iz baze (javna ruta)
  useEffect(() => {
    const fetchWorkingHours = async () => {
      const response = await fetch(API_ENDPOINTS.WORKING_HOURS, {
        method: 'GET',
      });
      const data = await response.json();
      setWorkingHours(data);
    };

    fetchWorkingHours();
  }, []);

   // Filtrirajte usluge prema odabranom polu
   useEffect(() => {
    const filteredServices = services.filter(service => service.gender === gender);
    setSelectedServices(filteredServices);
  }, [gender, services]);






  





  // Očistite localStorage nakon što se informacija pročita
  useEffect(() => {
    const noviTermin = localStorage.getItem('noviTermin');
    if (noviTermin) {
      // Emitujte događaj ili osvežite termine
      localStorage.removeItem('noviTermin');
      // Ovdje možete dodati logiku za osvežavanje termina ako je potrebno
    }
  }, []);

  const images = [...Array(6)].map((_, index) => ({
    before: require(`./slike-tanja-salon/${index + 1}.png`),
    after: require(`./slike-tanja-salon/${(index + 1) * 11}.png`),
  }));

  const handleImageClick = (index) => {
    setCurrentImageIndex(index); // Postavljamo trenutni indeks na izabranu sliku
  };
  useEffect(() => {
    const fetchServices = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.SERVICES, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setServices(data); // Proverite da li se podaci pravilno postavljaju
    };
  
    fetchServices();
  }, []);

  // Filtrirajte usluge prema odabranom polu
  useEffect(() => {
    const filteredServices = services.filter(service => service.gender === gender);
    setSelectedServices(filteredServices);
  }, [gender, services]);
  

  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Hero Section */}
      <section id="home" className="relative bg-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <img className="w-full h-full object-cover blur-sm" src={Pozadina} />
        </div>
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8  sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-lightbrown sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Dobrodošli u</span>{' '}
                  <span className="block text-lightbrown xl:inline">Frizerski Salon Tanja</span>
                </h1>
                <p className="mt-3 text-base text-white sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Otkrijte savršenu frizuru koja odražava vašu jedinstvenu ličnost. Naš tim stručnjaka je tu da vam pruži vrhunsku uslugu i nezaboravno iskustvo.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a href="#booking" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-beige hover:bg-beige-dark md:py-4 md:text-lg md:px-10" style={{backgroundColor: '#F0E4CC'}}>
                      Zakaži termin
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a href="#services" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-light hover:bg-primary-lighter md:py-4 md:text-lg md:px-10">
                      Naše usluge
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Naše usluge</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Sve što vam je potrebno za savršen izgled
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Od klasičnog šišanja do najmodernijih tehnika farbanja, naš salon nudi širok spektar usluga za sve vaše potrebe.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                { icon: Scissors, title: 'Šišanje', description: 'Profesionalno šišanje prilagođeno vašem stilu i obliku lica.' },
                { icon: Droplet, title: 'Farbanje', description: 'Širok spektar boja i tehnika farbanja za savršen izgled.' },
                { icon: Wind, title: 'Stilizovanje', description: 'Kreativno oblikovanje frizure za posebne prilike ili svakodnevni izgled.' },
                { icon: Star, title: 'Tretmani', description: 'Luksuzni tretmani za negu i oporavak vaše kose.' },
              ].map((service) => (
                <div key={service.title} className="relative">
                  <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#D2B48C] text-white">
                      <service.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{service.title}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{service.description}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Galerija</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Naši najnoviji radovi
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {images.map((image, index) => (
              <div key={index} className="group relative cursor-pointer" onClick={() => handleImageClick(index)}>
                <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                  <img
                    src={currentImageIndex === index ? image.after : image.before} // Prikazujemo sliku "posle" ako je izabrana
                    alt={`Frizura ${index + 1} ${currentImageIndex === index ? 'posle' : 'pre'}`}
                    className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <p >
                        <span aria-hidden="true" className="absolute inset-0"></span>
                        Frizura {index + 1}
                      </p>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">Opis frizure</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="working-hours" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Radno vreme</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Pogledajte naše radno vreme
            </p>
          </div>
          <div className="mt-10 flex justify-center">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden w-1/2 text-center">
              {workingHours.map((hours) => (
                <div key={hours.day} className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{hours.day}</h3>
                  <p className="text-sm text-gray-500">{hours.open == null ? 'Neradni dan' : `${hours.open} - ${hours.close}`}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <PromotionBanner />

      {/* Booking Section */}
      <section id="booking" className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto p-8 bg-gray-100 rounded-md shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Zakazivanje Termina</h1>
      <BookingForm />

     

   
    </div>
    
    </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Utisci klijenata</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Šta kažu naši klijenti
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Marija P.', quote: 'Najbolji salon u gradu! Uvek izađem zadovoljna i sa osmehom.' },
              { name: 'Jovan S.', quote: 'Profesionalno osoblje i prijatna atmosfera. Preporučujem svima!' },
              { name: 'Ana M.', quote: 'Konačno sam pronašla frizera koji razume šta želim. Hvala vam!' },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white shadow-lg rounded-lg p-6">
                <div className="flex items-center">
                  <User className="h-12 w-12 text-gray-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-gray-500">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Link to="/pregled-termina" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
  Pregled termina
</Link>

<section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Naša Lokacija</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Pronađite nas na mapi
            </p>
          </div>
          <div className="mt-10">
            <iframe
             src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d702.1202175702209!2d19.80997107417156!3d45.25828942057204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2srs!4v1729431158907!5m2!1sen!2srs" 
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Mapa"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Frizerski Salon Tanja</h3>
              <p className="text-gray-300">Vaša destinacija za savršenu frizuru i negu kose.</p>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Kontakt</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-300">
                  <Phone className="h-5 w-5 mr-2" />
                  +381 11 123 4567
                </li>
                <li className="flex items-center text-gray-300">
                  <MapPin className="h-5 w-5 mr-2" />
                  Glavna ulica 123, Beograd
                </li>
                <li className="flex items-center text-gray-300">
                  <Mail className="h-5 w-5 mr-2" />
                  info@salontanja.com
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Pratite nas</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Twitter className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 flex justify-between items-center">
            <p className="text-gray-300 text-sm">&copy; 2024 Frizerski Salon Tanja. Sva prava zadržana.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white text-sm">Politika privatnosti</a>
              <a href="#" className="text-gray-300 hover:text-white text-sm">Uslovi korišćenja</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
