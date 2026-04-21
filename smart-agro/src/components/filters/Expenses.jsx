import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { expenseAPI } from '../../api/expenseAPI';

const categories = ['seeds', 'fertilizer', 'pesticides', 'labour', 'irrigation', 'transport', 'machinery', 'misc'];
const seasons = ['Kharif', 'Rabi', 'Zaid'];

export default function Expenses(){
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    crop: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    season: '',
    notes: '',
    quantity: '',
    unit: 'kg',
    supplier: ''
  });

  // Load recent expenses from API
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await expenseAPI.list({ limit: 5, sort: '-date' });
      setList(response.data?.data || []);
    } catch (err) {
      console.log('Note: Could not load expenses from API');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.category || !formData.amount) {
        setError('Category and amount are required');
        setLoading(false);
        return;
      }

      // Auto-detect season if not selected
      let season = formData.season;
      if (!season) {
        const month = new Date(formData.date).getMonth();
        // Kharif: June-October (5-9), Rabi: October-March (9-2), Zaid: March-June (2-5)
        if (month >= 5 && month <= 9) season = 'Kharif';
        else if (month >= 9 || month <= 2) season = 'Rabi';
        else season = 'Zaid';
      }

      const submitData = {
        ...formData,
        season,
        amount: parseFloat(formData.amount),
        quantity: formData.quantity ? parseFloat(formData.quantity) : null
      };

      const response = await expenseAPI.create(submitData);
      
      // Add to list
      setList([response.data?.data, ...list].slice(0, 5));
      
      // Reset form
      setFormData({
        crop: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        season: '',
        notes: '',
        quantity: '',
        unit: 'kg',
        supplier: ''
      });

      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{padding:12,marginTop:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <h3 style={{margin:0}}>Expense Tracker</h3>
        <div style={{display:'flex',gap:8}}>
          <button 
            onClick={() => setShowModal(true)}
            style={{padding:'8px 12px',background:'#16a34a',color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontSize:'14px'}}
          >
            + Add Expense
          </button>
          <Link to="/expenses" style={{padding:'8px 12px',background:'#2ea49a',color:'#fff',border:'none',borderRadius:8,textDecoration:'none',fontSize:'14px'}}>
            📊 View Full Tracker
          </Link>
        </div>
      </div>

      {/* Recent Expenses List */}
      <div style={{marginTop:12}}>
        {list.length===0 && <div style={{color:'#666',fontSize:'14px'}}>No expenses yet</div>}
        {list.map((expense) => (
          <div key={expense._id} style={{padding:8,background:'#f9fafb',borderRadius:6,marginTop:6,borderLeft:'3px solid #16a34a'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'start'}}>
              <div>
                <div style={{fontWeight:'500',color:'#1f2937'}}>{expense.category} {expense.crop && `- ${expense.crop}`}</div>
                <div style={{fontSize:'12px',color:'#6b7280',marginTop:2}}>
                  {new Date(expense.date).toLocaleDateString('en-IN')} {expense.supplier && `• ${expense.supplier}`}
                </div>
              </div>
              <div style={{fontWeight:'600',color:'#16a34a',whiteSpace:'nowrap'}}>₹ {Number(expense.amount).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position:'fixed',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.5)',
          display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000
        }}>
          <div style={{
            backgroundColor:'#fff',borderRadius:12,padding:24,maxWidth:500,width:'90%',
            maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:'600'}}>Add New Expense</h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{background:'none',border:'none',cursor:'pointer',padding:0}}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{padding:12,backgroundColor:'#fee2e2',color:'#dc2626',borderRadius:6,marginBottom:12,fontSize:14}}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    style={{width:'100%',padding:8,border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    style={{width:'100%',padding:8,border:'1px solid #d1d5db',borderRadius:6,fontSize:14,boxSizing:'border-box'}}
                  />
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Crop</label>
                  <input
                    type="text"
                    name="crop"
                    value={formData.crop}
                    onChange={handleInputChange}
                    placeholder="e.g., rice"
                    style={{width:'100%',padding:8,border:'1px solid #d1d5db',borderRadius:6,fontSize:14,boxSizing:'border-box'}}
                  />
                </div>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    style={{width:'100%',padding:8,border:'1px solid #d1d5db',borderRadius:6,fontSize:14,boxSizing:'border-box'}}
                  />
                </div>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Season</label>
                  <select
                    name="season"
                    value={formData.season}
                    onChange={handleInputChange}
                    style={{width:'100%',padding:8,border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}
                  >
                    <option value="">Auto-detect</option>
                    {seasons.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="e.g., Local Market"
                    style={{width:'100%',padding:8,border:'1px solid #d1d5db',borderRadius:6,fontSize:14,boxSizing:'border-box'}}
                  />
                </div>
              </div>

              <div>
                <label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes..."
                  rows={3}
                  maxLength={500}
                  style={{width:'100%',padding:8,border:'1px solid #d1d5db',borderRadius:6,fontSize:14,boxSizing:'border-box',resize:'none'}}
                />
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    style={{width:'100%',padding:8,border:'1px solid #d1d5db',borderRadius:6,fontSize:14,boxSizing:'border-box'}}
                  />
                </div>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:500,marginBottom:4}}>Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    style={{width:'100%',padding:8,border:'1px solid #d1d5db',borderRadius:6,fontSize:14}}
                  >
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="piece">piece</option>
                    <option value="bag">bag</option>
                    <option value="hour">hour</option>
                    <option value="day">day</option>
                    <option value="acre">acre</option>
                    <option value="hectare">hectare</option>
                  </select>
                </div>
              </div>

              <div style={{display:'flex',gap:8,marginTop:16}}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex:1,padding:10,backgroundColor:'#16a34a',color:'#fff',border:'none',
                    borderRadius:6,fontWeight:500,cursor:loading?'not-allowed':'pointer',
                    opacity:loading?0.7:1
                  }}
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex:1,padding:10,backgroundColor:'#e5e7eb',color:'#374151',border:'none',
                    borderRadius:6,fontWeight:500,cursor:'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
