import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import LandingPage from './LandingPage';
import ProfilePage from './ProfilePage'; 
import TerminiPregled from './TerminiPregled';
import AdminPage from './AdminPage'; 
import { TerminiProvider } from './TerminiContext';
import ResetPasswordRequestPage from './ResetPasswordRequestPage';
import Magacin from './Magacin';
import ResetPasswordPage from './ResetPasswordPage'; 
function App() {
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (loggedUser) {
      setUser(loggedUser);
    }
  }, []);

  return (
    <TerminiProvider>
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
      <Route path="/admin" element={<AdminPage user={user} />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage setUser={setUser}  />} />
        <Route path="/profile" element={<ProfilePage user={user} />} /> 
        <Route path="/pregled-termina" element={<TerminiPregled />} />
        <Route path="/reset-password-request" element={<ResetPasswordRequestPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/magacin" element={<Magacin />} />
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
    </TerminiProvider>
  );
}

export default App;
