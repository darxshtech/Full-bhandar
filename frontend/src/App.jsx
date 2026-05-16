import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Farmers from './pages/Farmers';
import FarmerDetails from './pages/FarmerDetails';
import Traders from './pages/Traders';
import TraderDetails from './pages/TraderDetails';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="farmers" element={<Farmers />} />
          <Route path="farmers/:id" element={<FarmerDetails />} />
          <Route path="traders" element={<Traders />} />
          <Route path="traders/:id" element={<TraderDetails />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
