import React, { useState } from 'react';
import { api } from '../services/api';
import type { TransactionInput } from '../services/api';
import { Activity, ShieldAlert, ShieldCheck } from 'lucide-react';

const ManualTestForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<TransactionInput>>({
    Time: 0, Amount: 100, V1: 0, V2: 0, V3: 0, V4: 0, V5: 0, V6: 0, V7: 0, V8: 0,
    V9: 0, V10: 0, V11: 0, V12: 0, V13: 0, V14: 0, V15: 0, V16: 0, V17: 0, V18: 0,
    V19: 0, V20: 0, V21: 0, V22: 0, V23: 0, V24: 0, V25: 0, V26: 0, V27: 0, V28: 0
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.predict(formData as TransactionInput);
      setResult(res.prediction);
    } catch (err) {
      console.error(err);
      alert('Prediction failed. Ensure backend is running.');
    }
    setLoading(false);
  };

  const loadFraudSample = () => {
    // Fill with extreme values typical of fraud in this synthetic set
    setFormData(prev => ({
      ...prev,
      Amount: 8500,
      V1: 2.5, V2: 3.1, V3: -5.4, V4: 4.2, V5: 1.5,
      V10: -4.0, V12: -6.5, V14: -7.2, V17: -5.0
    }));
  };

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">Manual Transaction Test</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Amount ($)</label>
            <input 
              type="number" 
              value={formData.Amount}
              onChange={e => setFormData({...formData, Amount: parseFloat(e.target.value)})}
              className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
             <label className="block text-xs text-gray-400 mb-1">Time</label>
             <input 
               type="number" 
               value={formData.Time}
               onChange={e => setFormData({...formData, Time: parseFloat(e.target.value)})}
               className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
             />
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-2">PCA Features (V1-V28). Try extreme values (e.g. &lt; -3 or &gt; 3) to trigger fraud.</div>
        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
          {Array.from({length: 28}, (_, i) => i + 1).map(i => (
            <div key={`V${i}`}>
              <label className="block text-[10px] text-gray-500 mb-1">V{i}</label>
              <input 
                type="number" 
                step="0.1"
                value={(formData as any)[`V${i}`]}
                onChange={e => setFormData({...formData, [`V${i}`]: parseFloat(e.target.value)})}
                className="w-full bg-slate-800/50 border border-slate-600 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="flex space-x-3 pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Predicting...' : 'Predict Risk'}
          </button>
          <button 
            type="button" 
            onClick={loadFraudSample}
            className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            Load Fraud Sample
          </button>
        </div>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg border ${
          result.risk_level === 'High' ? 'bg-red-500/10 border-red-500/50' : 
          result.risk_level === 'Medium' ? 'bg-amber-500/10 border-amber-500/50' : 
          'bg-green-500/10 border-green-500/50'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {result.risk_level === 'High' ? <ShieldAlert className="text-red-400 w-5 h-5"/> : 
             result.risk_level === 'Medium' ? <Activity className="text-amber-400 w-5 h-5"/> : 
             <ShieldCheck className="text-green-400 w-5 h-5"/>}
            <span className="font-semibold text-lg">Result: {result.risk_level} Risk</span>
          </div>
          <div className="text-sm">
            <p>Fraud Probability: <span className="font-bold">{(result.fraud_probability * 100).toFixed(2)}%</span></p>
            {result.top_features && (
              <div className="mt-2">
                <p className="text-xs opacity-80 mb-1">Top Contributing Features:</p>
                <ul className="text-xs list-disc pl-4">
                  {Object.entries(result.top_features).map(([feat, val]) => (
                    <li key={feat}>{feat}: {Number(val).toFixed(3)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualTestForm;
