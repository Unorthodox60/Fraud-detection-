import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface LiveFeedProps {
  transactions: any[];
}

const LiveFeed: React.FC<LiveFeedProps> = ({ transactions }) => {
  const getRiskColor = (level: string) => {
    switch(level) {
      case 'High': return 'border-red-500/50 bg-red-500/10 text-red-400';
      case 'Medium': return 'border-amber-500/50 bg-amber-500/10 text-amber-400';
      default: return 'border-green-500/50 bg-green-500/10 text-green-400';
    }
  };

  const getRiskIcon = (level: string) => {
    switch(level) {
      case 'High': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'Medium': return <Info className="w-5 h-5 text-amber-500" />;
      default: return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="glass-panel p-6 h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-200">Live Transaction Feed</h3>
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      </div>
      
      <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className={`border rounded-lg p-4 transition-all duration-300 hover:scale-[1.02] ${getRiskColor(tx.risk_level)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                {getRiskIcon(tx.risk_level)}
                <span className="font-semibold">Tx #{tx.id}</span>
              </div>
              <span className="text-sm opacity-80">
                {new Date(tx.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
              <div>
                <span className="opacity-70 block text-xs">Amount</span>
                <span className="font-medium">${tx.amount.toFixed(2)}</span>
              </div>
              <div>
                <span className="opacity-70 block text-xs">Fraud Prob.</span>
                <span className="font-medium">{(tx.fraud_probability * 100).toFixed(1)}%</span>
              </div>
            </div>

            {tx.risk_level !== 'Low' && tx.top_features && (
              <div className="mt-3 pt-3 border-t border-current/20">
                <span className="text-xs opacity-80 mb-1 block">Top Suspicious Features (SHAP)</span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(tx.top_features).map(([feat, val]) => (
                    <span key={feat} className="px-2 py-1 bg-black/20 rounded">
                      {feat}: {Number(val).toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {transactions.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No transactions yet. Start the simulation.
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;
