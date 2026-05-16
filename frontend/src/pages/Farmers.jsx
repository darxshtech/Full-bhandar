import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Plus, User, Search, Edit2, Trash2 } from 'lucide-react';

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const res = await api.get('/farmers');
      setFarmers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFarmer) {
        await api.put(`/farmers/${editingFarmer._id}`, formData);
      } else {
        await api.post('/farmers', formData);
      }
      setShowModal(false);
      setEditingFarmer(null);
      setFormData({ name: '', phone: '', address: '' });
      fetchFarmers();
    } catch (err) {
      console.error(err);
      alert('Error saving farmer');
    }
  };

  const handleEdit = (farmer) => {
    setEditingFarmer(farmer);
    setFormData({ name: farmer.name, phone: farmer.phone || '', address: farmer.address || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    console.log('Deleting farmer:', id);
    try {
      await api.delete(`/farmers/${id}`);
      fetchFarmers();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting farmer');
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Farmers Directory</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Farmer
        </button>
      </div>

      <div className="card">
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input type="text" className="form-control" placeholder="Search farmers..." style={{ paddingLeft: '2.5rem' }} />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Farmer Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Pending Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map(farmer => (
                <tr key={farmer._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontWeight: 500 }}>{farmer.name}</span>
                    </div>
                  </td>
                  <td>{farmer.phone || '-'}</td>
                  <td>{farmer.address || '-'}</td>
                  <td>
                    <span style={{ color: farmer.balance > 0 ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>
                      ₹{farmer.balance.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link to={`/farmers/${farmer._id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}>
                        View
                      </Link>
                      <button onClick={() => handleEdit(farmer)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--primary)' }}>
                        <Edit2 size={14} style={{ pointerEvents: 'none' }} />
                      </button>
                      <button onClick={() => handleDelete(farmer._id)} className="btn btn-outline" style={{ padding: '0.4rem 0.6rem', color: 'var(--danger)' }}>
                        <Trash2 size={14} style={{ pointerEvents: 'none' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {farmers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)' }}>
                    No farmers found. Add a new farmer to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingFarmer(null); setFormData({ name: '', phone: '', address: '' }); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}</h2>
              <button onClick={() => { setShowModal(false); setEditingFarmer(null); setFormData({ name: '', phone: '', address: '' }); }} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Farmer Name *</label>
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
                <button type="submit" className="btn btn-primary">Save Farmer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
