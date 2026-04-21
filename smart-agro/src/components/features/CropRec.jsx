import React, { useState, useEffect } from 'react';

export default function CropRecommendation() {
  // State management
  const [stateValue, setStateValue] = useState('');
  const [districtValue, setDistrictValue] = useState('');
  const [season, setSeason] = useState('Kharif');
  const [n, setN] = useState('');
  const [p, setP] = useState('');
  const [k, setK] = useState('');
  const [ph, setPh] = useState('');
  const [water, setWater] = useState('Medium');
  const [unknownNpk, setUnknownNpk] = useState(false);
  const [regionState, setRegionState] = useState('');
  const [regionDistrict, setRegionDistrict] = useState('');
  const [texture, setTexture] = useState('');
  const [organic, setOrganic] = useState('');
  const [irrigationQ, setIrrigationQ] = useState('');
  const [soilCardFile, setSoilCardFile] = useState(null);
  const [results, setResults] = useState([]);

  // Sample data
  const states = [
    { state: 'Maharashtra', districts: ['Pune', 'Nagpur', 'Ahmednagar'] },
    { state: 'Karnataka', districts: ['Bengaluru', 'Mysore', 'Dharwad'] },
    { state: 'Punjab', districts: ['Ludhiana', 'Amritsar', 'Ferozepur'] }
  ];

  const regionDistricts = states.find(s => s.state === regionState)?.districts || [];

  const useRegion = async () => {
    if (!regionState) {
      alert('Select state');
      return;
    }
    try {
      const res = await fetch(`/api/soil/region?state=${encodeURIComponent(regionState)}&district=${encodeURIComponent(regionDistrict || '')}`);
      if (!res.ok) {
        const txt = await res.json().catch(() => ({ error: 'No data' }));
        alert('Region data not available: ' + (txt.error || res.statusText));
        return;
      }
      const r = await res.json();
      if (r && r.data) {
        setN(r.data.n);
        setP(r.data.p);
        setK(r.data.k);
        setPh(r.data.ph);
        alert('Values filled from regional averages. Please confirm before submitting.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch region data');
    }
  };

  const useQuestionnaire = async () => {
    if (!texture || !organic || !irrigationQ) {
      alert('Please answer all fields');
      return;
    }
    try {
      const res = await fetch('/api/soil/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texture, organic, irrigation: irrigationQ })
      });
      const out = await res.json();
      if (out.success && out.data) {
        setN(out.data.n);
        setP(out.data.p);
        setK(out.data.k);
        setPh(out.data.ph);
        alert('Estimated values filled. Confirm before submit.');
      } else {
        alert('Estimation failed');
      }
    } catch (err) {
      console.error(err);
      alert('Estimation error');
    }
  };

  const uploadSoilCard = async () => {
    if (!soilCardFile) {
      alert('Pick an image first');
      return;
    }
    const fd = new FormData();
    fd.append('file', soilCardFile);
    try {
      const res = await fetch('/api/soil/ocr', { method: 'POST', body: fd });
      const out = await res.json();
      if (out.success && out.parsed) {
        const p = out.parsed;
        if (p.n) setN(p.n);
        if (p.p) setP(p.p);
        if (p.k) setK(p.k);
        if (p.ph) setPh(p.ph);
        alert(`OCR parsed. N=${p.n || '?'}, P=${p.p || '?'}, K=${p.k || '?'}, pH=${p.ph || '?'}`);
      } else {
        alert('OCR failed: ' + (out.error || ''));
      }
    } catch (err) {
      console.error(err);
      alert('Upload error');
    }
  };

  const clearSoilCard = () => setSoilCardFile(null);

  const resetForm = () => {
    setN('');
    setP('');
    setK('');
    setPh('');
    setWater('Medium');
    setSeason('Kharif');
    setUnknownNpk(false);
    setResults([]);
  };

  const getRecommendations = async () => {
    const data = {
      state: stateValue,
      district: districtValue,
      season,
      n: n ? Number(n) : null,
      p: p ? Number(p) : null,
      k: k ? Number(k) : null,
      ph: ph ? Number(ph) : null,
      water
    };

    try {
      const res = await fetch('/api/crops/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        // try to read error body
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody && errBody.error ? errBody.error : res.statusText || 'Server error';
        console.error('Recommendation API error', res.status, msg);
        alert('Recommendation failed: ' + msg);
        setResults([]);
        return;
      }

      const out = await res.json();
      if (!out.success) {
        alert('Recommendation failed: ' + (out.error || 'unknown'));
        setResults([]);
        return;
      }
      setResults(out.recommendations || []);
    } catch (err) {
      console.error(err);
      alert('Recommendation error: ' + (err.message || err));
    }
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 10px 0', fontSize: 22 }}>Crop Recommendation</h1>
      <p style={{ color: '#6b7b7f', fontSize: 13 }}>Choose a flow: If you don't know NPK/pH, use regional averages or the beginner questionnaire (or upload a Soil Health Card).</p>

      {/* Basic inputs */}
      <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: '#fbffff', border: '1px solid #eef7f6' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>State</label>
                <select value={stateValue} onChange={(e) => setStateValue(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #dbe9e8', marginBottom: 12 }}>
                  <option value="">-- Select state --</option>
                  {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>District</label>
                <select value={districtValue} onChange={(e) => setDistrictValue(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #dbe9e8', marginBottom: 12 }}>
                  <option value="">-- Select district --</option>
                  {states.find(s => s.state === stateValue)?.districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Season</label>
                <select value={season} onChange={(e) => setSeason(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #dbe9e8', marginBottom: 12 }}>
                  <option>Kharif</option>
                  <option>Rabi</option>
                  <option>Zaid</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>N (Nitrogen) kg/ha</label>
                <input type="number" value={n} onChange={(e) => setN(e.target.value)} placeholder="e.g. 80" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #dbe9e8', marginBottom: 12 }} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>P (Phosphorus) kg/ha</label>
                <input type="number" value={p} onChange={(e) => setP(e.target.value)} placeholder="e.g. 25" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #dbe9e8', marginBottom: 12 }} />
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>K (Potassium) kg/ha</label>
                <input type="number" value={k} onChange={(e) => setK(e.target.value)} placeholder="e.g. 60" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #dbe9e8', marginBottom: 12 }} />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>pH</label>
                <input type="number" step="0.1" value={ph} onChange={(e) => setPh(e.target.value)} placeholder="6.5" style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #dbe9e8', marginBottom: 12 }} />
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 700 }}>Water availability</label>
              <select value={water} onChange={(e) => setWater(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #dbe9e8', marginBottom: 12 }}>
                <option>Medium</option>
                <option>Low</option>
                <option>High</option>
              </select>
            </div>

 


            <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
              <button onClick={getRecommendations} style={{ background: 'linear-gradient(90deg,#2ea49a,#2b93c6)', color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 800 }}>Get Recommendations</button>
              <button onClick={resetForm} style={{ background: 'transparent', border: '1px solid #2ea49a', color: '#2ea49a', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 800 }}>Reset</button>
            </div>
          </div>

          {/* Results */}
          <div style={{ marginTop: 12 }}>
            {results.length === 0 ? (
              <div style={{ background: '#f6fffb', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #e6f6f2' }}>
                No recommendations yet
              </div>
            ) : (
              results.map((r, idx) => (
                <div key={idx} style={{ background: '#f6fffb', borderRadius: 8, padding: 12, marginBottom: 8, border: '1px solid #e6f6f2' }}>
                  <strong>{r.crop_name}</strong>
                  <div style={{ color: '#6b7b7f', fontSize: 13 }}>Soil: {r.soil || '-'} · Season: {r.season || '-'}</div>
                  <div style={{ marginTop: 8 }}>Expected yield: {r.expected_yield || '-'} · Price: ₹{r.price_per_quintal || '-'} / qtl</div>
                  <div style={{ marginTop: 6 }}>Recommended N-P-K (kg/ha): N:{r.n_req || '-'}, P:{r.p_req || '-'}, K:{r.k_req || '-'}</div>
                  <div style={{ marginTop: 6, color: '#6b7b7f', fontSize: 13 }}>Score: {r.score}</div>
                </div>
              ))
            )}
          </div>
        </div>
  );
}