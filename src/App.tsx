import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home';
import Principal from './pages/principal/Principal';
import PanoramaViewer from './pages/panoramaViewer/PanoramaViewer'; // Nova página
import Manage from './pages/manage/Manage';
import UserManagement from './pages/userManagement/UserManagement';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/manage" element={<Manage />} />
      <Route path="/userManagement" element={<UserManagement />} />
      <Route path="/principal" element={<Principal />} />
      <Route path="/panorama/:imageName" element={<PanoramaViewer />} /> {/* Nova rota */}
    </Routes>
  );
};

export default App;
