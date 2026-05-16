import { useState, useEffect } from 'react';
import api from '../services/api';
import { PackageOpen, TrendingUp, IndianRupee, WalletCards, CreditCard, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState({
    materialInToday: { totalWeight: 0, totalAmount: 0 },
    salesToday: { totalWeight: 0, totalAmount: 0 },
    totalCashIn: 0,
    totalCashOut: 0,
    pendingToFarmers: 0,
    pendingFromTraders: 0
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = [
    { name: 'Today', 'Material In (₹)': data.materialInToday.totalAmount, 'Sales (₹)': data.salesToday.totalAmount }
  ];

  return (
    <div>
      <h1 className="page-title">Dashboard Overview</h1>
      
      <div className="dashboard-grid">
        <div className="summary-card">
          <div className="summary-icon in"><PackageOpen size={28} /></div>
          <div className="summary-info">
            <h3>Material In (Today)</h3>
            <p>₹{data.materialInToday.totalAmount.toLocaleString('en-IN')}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{data.materialInToday.totalWeight} Carrets</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon neutral"><TrendingUp size={28} /></div>
          <div className="summary-info">
            <h3>Sales (Today)</h3>
            <p>₹{data.salesToday.totalAmount.toLocaleString('en-IN')}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{data.salesToday.totalWeight} Carrets</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon in"><IndianRupee size={28} /></div>
          <div className="summary-info">
            <h3>Total Cash In</h3>
            <p>₹{data.totalCashIn.toLocaleString('en-IN')}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>From Traders</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon out"><WalletCards size={28} /></div>
          <div className="summary-info">
            <h3>Total Cash Out</h3>
            <p>₹{data.totalCashOut.toLocaleString('en-IN')}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>To Farmers</span>
          </div>
        </div>

        <div className="summary-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="summary-icon out" style={{ background: 'transparent' }}><Clock size={28} /></div>
          <div className="summary-info">
            <h3>Pending to Farmers</h3>
            <p>₹{data.pendingToFarmers.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="summary-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div className="summary-icon in" style={{ background: 'transparent' }}><CreditCard size={28} /></div>
          <div className="summary-info">
            <h3>Pending from Traders</h3>
            <p>₹{data.pendingFromTraders.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Today's Transaction Overview</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
            <Bar dataKey="Material In (₹)" fill="var(--danger)" radius={[4, 4, 0, 0]} barSize={40} />
            <Bar dataKey="Sales (₹)" fill="var(--success)" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
