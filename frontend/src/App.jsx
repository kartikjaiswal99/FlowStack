import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import BuilderPage from './pages/BuilderPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/stack/:id" element={<BuilderPage />} />
    </Routes>
  );
}

export default App;