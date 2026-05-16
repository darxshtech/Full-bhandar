import { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Download, TrendingUp, PackageOpen } from 'lucide-react';

export default function Reports() {
  const [reportData, setReportData] = useState({
    materialIn: { totalWeight: 0, totalAmount: 0 },
    sales: { totalWeight: 0, totalAmount: 0 },
    cashIn: 0,
    cashOut: 0
  });
  
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today
  });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await api.get('/dashboard/reports', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setReportData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReport();
  };

  return (
    <div>
      <h1 className="page-title">Reports & Analytics</h1>

      <div className="card">
        <form onSubmit={handleFilter} className="flex-between" style={{ gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Start Date</label>
              <input type="date" className="form-control" value={dateRange.startDate} onChange={e => setDateRange({...dateRange, startDate: e.target.value})} />
            </div>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>End Date</label>
              <input type="date" className="form-control" value={dateRange.endDate} onChange={e => setDateRange({...dateRange, endDate: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginTop: 'auto' }}>
            <button type="submit" className="btn btn-primary">
              <Calendar size={18} /> Apply Filter
            </button>
            <button type="button" className="btn btn-outline" onClick={() => window.print()}>
              <Download size={18} /> Export PDF
            </button>
          </div>
        </form>
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="summary-icon in"><PackageOpen size={24} /></div>
            <h2 style={{ fontSize: '1.25rem' }}>Total Material Received</h2>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-light)' }}>Total Quantity:</span>
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{reportData.materialIn.totalWeight} Carrets</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-light)' }}>Total Value:</span>
              <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-main)' }}>₹{reportData.materialIn.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="summary-icon neutral"><TrendingUp size={24} /></div>
            <h2 style={{ fontSize: '1.25rem' }}>Total Sales (Material Out)</h2>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-light)' }}>Total Quantity Sold:</span>
              <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{reportData.sales.totalWeight} Carrets</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-light)' }}>Total Sales Value:</span>
              <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--text-main)' }}>₹{reportData.sales.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="summary-icon out" style={{ background: '#fef3f2', color: '#b42318' }}><TrendingUp size={24} /></div>
            <h2 style={{ fontSize: '1.25rem' }}>Cash Flow Summary</h2>
          </div>
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-light)' }}>Cash In (Receipts):</span>
              <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--success)' }}>+ ₹{reportData.cashIn.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <span style={{ color: 'var(--text-light)' }}>Cash Out (Payments):</span>
              <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--danger)' }}>- ₹{reportData.cashOut.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex-between" style={{ borderTop: '1px dotted var(--border-color)', paddingTop: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Net Cash Flow:</span>
              <span style={{ fontWeight: 700, fontSize: '1.5rem', color: (reportData.cashIn - reportData.cashOut) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                ₹{(reportData.cashIn - reportData.cashOut).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
