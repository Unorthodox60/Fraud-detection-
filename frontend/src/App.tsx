import { useState, useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import Dashboard from './components/Dashboard';
import LiveFeed from './components/LiveFeed';
import ManualTestForm from './components/ManualTestForm';
import { api } from './services/api';

function App() {
  const [stats, setStats] = useState({ total_transactions: 0, flagged_count: 0, fraud_rate: 0 });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationInterval = useRef<number | null>(null);

  const fetchStatsAndFeed = async () => {
    try {
      const [statsData, feedData] = await Promise.all([
        api.getStats(),
        api.getRecentTransactions(20) // Get last 20 for feed
      ]);
      setStats(statsData);
      setRecentTransactions(feedData);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchStatsAndFeed();
    const interval = setInterval(fetchStatsAndFeed, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      setIsSimulating(false);
    } else {
      setIsSimulating(true);
      // Run once immediately, then interval
      api.simulate(3, 0.1).then(fetchStatsAndFeed);
      simulationInterval.current = window.setInterval(async () => {
        await api.simulate(2, 0.05); // Simulate 2 tx every 3s
        fetchStatsAndFeed();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                FraudShield AI
              </span>
            </div>
            <div>
              <button 
                onClick={toggleSimulation}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isSimulating 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                    : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'
                }`}
              >
                {isSimulating ? 'Stop Simulation' : 'Start Live Stream'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Real-Time Risk Monitoring</h1>
          <p className="text-slate-400">AI-powered detection of fraudulent financial activities using XGBoost & SHAP.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Dashboard stats={stats} recentTransactions={recentTransactions} />
            <ManualTestForm />
          </div>
          <div className="lg:col-span-1">
            <LiveFeed transactions={recentTransactions} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
