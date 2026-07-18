import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';

interface StatsProps {
  stats: {
    total_transactions: number;
    flagged_count: number;
    fraud_rate: number;
  };
  recentTransactions: any[];
}

const Dashboard: React.FC<StatsProps> = ({ stats, recentTransactions }) => {
  // Mock time series data for the chart based on recent transactions
  const timeSeriesData = [...recentTransactions].reverse().map((t) => ({
    time: new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
    prob: t.fraud_probability * 100
  })).slice(-20); // Last 20 for chart

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Activity className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Transactions</p>
            <h3 className="text-2xl font-bold">{stats.total_transactions}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center space-x-4">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Flagged (Med/High)</p>
            <h3 className="text-2xl font-bold">{stats.flagged_count}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <ShieldCheck className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Overall Fraud Rate</p>
            <h3 className="text-2xl font-bold">{(stats.fraud_rate * 100).toFixed(2)}%</h3>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Recent Risk Probabilities</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Line type="monotone" dataKey="prob" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
