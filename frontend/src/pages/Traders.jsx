import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, UserSquare2, Search, Edit2, Trash2 } from 'lucide-react';

export default function Traders() {
  const [traders, setTraders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTrader, setEditingTrader] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    fetchTraders();
  }, []);

  const fetchTraders = async () => {
    try {
      const res = await api.get('/traders');
      setTraders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrader) {
        await api.put(`/traders/${editingTrader._id}`, formData);
      } else {
        await api.post('/traders', formData);
      }
      setShowModal(false);
      setEditingTrader(null);
      setFormData({ name: '', phone: '', address: '' });
      fetchTraders();
    } catch (err) {
      console.error(err);
      alert('Error saving trader');
    }
  };

  const handleEdit = (trader) => {
    setEditingTrader(trader);
    setFormData({ name: trader.name, phone: trader.phone || '', address: trader.address || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    console.log('Deleting trader:', id);
    try {
      await api.delete(`/traders/${id}`);
      fetchTraders();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting trader');
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Traders Directory</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Trader
        </button>
      </div>

      <div className="card">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input type="text" className="form-control" placeholder="Search traders..." style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Trader Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Pending Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {traders.map(trader => (
                <tr key={trader._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserSquare2 size={16} />
                      </div>
                      <span style={{ fontWeight: 500 }}>{trader.name}</span>
                    </div>
                  </td>
                  <td>{trader.phone || '-'}</td>
                  <td>{trader.address || '-'}</td>
                  <td>
                    <span style={{ color: trader.balance > 0 ? 'var(--success)' : 'var(--text-main)', fontWeight: 600 }}>
                      ₹{trader.balance.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/traders/${trader._id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                        View
                      </Link>
                      <button onClick={() => handleEdit(trader)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--primary)' }}>
                        <Edit2 size={14} style={{ pointerEvents: 'none' }} />
                      </button>
                      <button onClick={() => handleDelete(trader._id)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)' }}>
                        <Trash2 size={14} style={{ pointerEvents: 'none' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {traders.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                    No traders found. Add a new trader to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingTrader(null); setFormData({ name: '', phone: '', address: '' }); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTrader ? 'Edit Trader' : 'Add New Trader'}</h2>
              <button onClick={() => { setShowModal(false); setEditingTrader(null); setFormData({ name: '', phone: '', address: '' }); }} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Trader Name *</label>
                <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Trader</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
