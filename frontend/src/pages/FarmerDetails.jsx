import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Plus, Download, Send, Edit2, Trash2 } from 'lucide-react';

export default function FarmerDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('bills');
  const [showBillModal, setShowBillModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [editingBill, setEditingBill] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  const [billForm, setBillForm] = useState({ productName: '', weight: '', rate: '', date: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: '', notes: '', billId: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/farmers/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBillSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBill) {
        await api.put(`/farmers/${id}/bills/${editingBill._id}`, billForm);
      } else {
        await api.post(`/farmers/${id}/bills`, billForm);
      }
      setShowBillModal(false);
      setEditingBill(null);
      setBillForm({ productName: '', weight: '', rate: '', date: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error saving bill');
    }
  };

  const handleBillEdit = (bill) => {
    setEditingBill(bill);
    setBillForm({ 
      productName: bill.productName, 
      weight: bill.weight, 
      rate: bill.rate, 
      date: bill.date ? new Date(bill.date).toISOString().split('T')[0] : '' 
    });
    setShowBillModal(true);
  };

  const handleBillDelete = async (billId) => {
    try {
      await api.delete(`/farmers/${id}/bills/${billId}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error deleting bill');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await api.put(`/farmers/${id}/payments/${editingPayment._id}`, paymentForm);
      } else {
        await api.post(`/farmers/${id}/payments`, paymentForm);
      }
      setShowPaymentModal(false);
      setEditingPayment(null);
      setPaymentForm({ amount: '', date: '', notes: '', billId: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error saving payment');
    }
  };

  const handlePaymentEdit = (payment) => {
    setEditingPayment(payment);
    setPaymentForm({ 
      amount: payment.amount, 
      date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : '', 
      notes: payment.notes || '', 
      billId: payment.billId || '' 
    });
    setShowPaymentModal(true);
  };

  const handlePaymentDelete = async (paymentId) => {
    try {
      await api.delete(`/farmers/${id}/payments/${paymentId}`);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error deleting payment');
    }
  };

  const generateWhatsAppLink = (receipt) => {
    if (!data) return '#';
    const text = `*Receipt from AgroManage*\n\nReceipt No: ${receipt.receiptNumber}\nDate: ${new Date(receipt.date).toLocaleDateString()}\nFarmer: ${data.farmer.name}\n\n*Amount Paid: ₹${receipt.amount}*\n*Pending Balance: ₹${data.farmer.balance}*\n\nThank you for your business!`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/farmers" className="btn btn-outline" style={{ padding: '0.5rem' }}><ArrowLeft size={20} /></Link>
          <h1 className="page-title" style={{ marginBottom: 0 }}>{data.farmer.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setShowPaymentModal(true)}>
            Record Payment (Debit)
          </button>
          <button className="btn btn-primary" onClick={() => setShowBillModal(true)}>
            <Plus size={18} /> Add Material In
          </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="summary-card">
          <div className="summary-info">
            <h3>Contact Info</h3>
            <p style={{ fontSize: '1.1rem' }}>{data.farmer.phone || 'N/A'}</p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{data.farmer.address}</span>
          </div>
        </div>
        <div className="summary-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div className="summary-info">
            <h3>Pending Balance (To Pay)</h3>
            <p>₹{data.farmer.balance.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <button 
            style={{ padding: '1rem 0', fontWeight: 600, borderBottom: activeTab === 'bills' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'bills' ? 'var(--primary)' : 'var(--text-light)' }}
            onClick={() => setActiveTab('bills')}
          >
            Material In (Bills)
          </button>
          <button 
            style={{ padding: '1rem 0', fontWeight: 600, borderBottom: activeTab === 'payments' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'payments' ? 'var(--primary)' : 'var(--text-light)' }}
            onClick={() => setActiveTab('payments')}
          >
            Payment History
          </button>
        </div>

        {activeTab === 'bills' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Bill No.</th>
                  <th>Product Details</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.bills.map(bill => (
                  <tr key={bill._id}>
                    <td>{new Date(bill.date).toLocaleDateString()}</td>
                    <td>{bill.billNumber}</td>
                    <td>
                      <div>{bill.productName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{bill.weight} Carret × ₹{bill.rate}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{bill.totalAmount}</td>
                    <td>₹{bill.paidAmount}</td>
                    <td>
                      <span className={`badge ${bill.status.toLowerCase()}`}>{bill.status}</span>
                    </td>
                    <td>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button onClick={() => handleBillEdit(bill)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--primary)' }}>
                           <Edit2 size={14} style={{ pointerEvents: 'none' }} />
                         </button>
                         <button onClick={() => handleBillDelete(bill._id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}>
                           <Trash2 size={14} style={{ pointerEvents: 'none' }} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {data.bills.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No bills found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Receipt No.</th>
                  <th>Against Bill</th>
                  <th>Amount Paid</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map(payment => (
                  <tr key={payment._id}>
                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                    <td>{payment.receiptNumber}</td>
                    <td>{payment.billId ? 'Specific Bill' : 'Account Balance'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>₹{payment.amount}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} 
                          title="Print Receipt"
                          onClick={() => window.print()}
                        >
                          <Download size={14} style={{ pointerEvents: 'none' }} />
                        </button>
                         <button onClick={() => handlePaymentEdit(payment)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--primary)' }}>
                           <Edit2 size={14} style={{ pointerEvents: 'none' }} />
                         </button>
                         <button onClick={() => handlePaymentDelete(payment._id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }}>
                           <Trash2 size={14} style={{ pointerEvents: 'none' }} />
                         </button>
                        <a href={generateWhatsAppLink(payment)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#25D366', borderColor: '#25D366' }} title="Share on WhatsApp">
                          <Send size={14} style={{ pointerEvents: 'none' }} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.payments.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Modal */}
      {showBillModal && (
        <div className="modal-overlay" onClick={() => { setShowBillModal(false); setEditingBill(null); setBillForm({ productName: '', weight: '', rate: '', date: '' }); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBill ? 'Edit Material In' : 'Add Material In'}</h2>
              <button onClick={() => { setShowBillModal(false); setEditingBill(null); setBillForm({ productName: '', weight: '', rate: '', date: '' }); }} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handleBillSubmit}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={billForm.date} onChange={e => setBillForm({...billForm, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Product Name *</label>
                <input type="text" className="form-control" required value={billForm.productName} onChange={e => setBillForm({...billForm, productName: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Weight (Carret) *</label>
                  <input type="number" className="form-control" required value={billForm.weight} onChange={e => setBillForm({...billForm, weight: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Rate per Carret *</label>
                  <input type="number" className="form-control" required value={billForm.rate} onChange={e => setBillForm({...billForm, rate: e.target.value})} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem', background: '#f9fafb', padding: '1rem', borderRadius: '8px', textAlign: 'right' }}>
                <span style={{ color: 'var(--text-light)' }}>Total Amount: </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{((billForm.weight || 0) * (billForm.rate || 0)).toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowBillModal(false); setEditingBill(null); setBillForm({ productName: '', weight: '', rate: '', date: '' }); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => { setShowPaymentModal(false); setEditingPayment(null); setPaymentForm({ amount: '', date: '', notes: '', billId: '' }); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPayment ? 'Edit Payment' : 'Record Payment to Farmer'}</h2>
              <button onClick={() => { setShowPaymentModal(false); setEditingPayment(null); setPaymentForm({ amount: '', date: '', notes: '', billId: '' }); }} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label>Date</label>
                <input type="date" className="form-control" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} />
              </div>
               <div className="form-group">
                 <label>Amount to Pay *</label>
                 <input type="number" className="form-control" required max={data.farmer.balance + (editingPayment ? editingPayment.amount : 0)} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} />
                 <small style={{ color: 'var(--text-light)' }}>Pending Balance: ₹{data.farmer.balance}</small>
               </div>
              <div className="form-group">
                <label>Against Specific Bill (Optional)</label>
                <select className="form-control" value={paymentForm.billId} onChange={e => setPaymentForm({...paymentForm, billId: e.target.value})}>
                  <option value="">-- Apply to Overall Balance --</option>
                  {data.bills.filter(b => b.status !== 'PAID').map(b => (
                    <option key={b._id} value={b._id}>{b.billNumber} (Pending: ₹{b.totalAmount - b.paidAmount})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
