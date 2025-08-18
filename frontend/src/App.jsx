import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './components/Auth/UserContext';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import GeolocationPage from './pages/GeolocationPage';
import SchedulingPage from './pages/SchedulingPage';
import MapPage from './pages/MapPage';
import PrescriptionPage from './pages/PrescriptionPage';
import ReceitasPage from './pages/ReceitasPage';
import AlertPage from './pages/AlertPage';
import MessagePage from './pages/MessagePage';
import MeetingPage from './pages/MeetingPage';
import PacientePage from './pages/PacientePage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/geolocalizacao" element={<GeolocationPage />} />
            <Route path="/agendamento" element={<SchedulingPage />} />
            <Route path="/agendamento-page" element={<SchedulingPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/receitas" element={<PrescriptionPage />} />
            <Route path="/receitas-page" element={<ReceitasPage />} />
            <Route path="/alertas" element={<AlertPage />} />
            <Route path="/mensagens" element={<MessagePage />} />
            <Route path="/reunioes" element={<MeetingPage />} />
            <Route path="/paciente" element={<PacientePage />} />
            <Route path="/home" element={<HomePage />} />
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  );
}

export default App;



