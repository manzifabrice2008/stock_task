import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Reports = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [inRes, outRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/incoming`),
          axios.get(`${API_BASE_URL}/outgoing`)
        ]);
        setIncoming(inRes.data);
        setOutgoing(outRes.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const calculateStats = (items) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let daily = 0;
    let weekly = 0;
    let monthly = 0;

    items.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate >= today) daily += item.quantity;
      if (itemDate >= startOfWeek) weekly += item.quantity;
      if (itemDate >= startOfMonth) monthly += item.quantity;
    });

    return { daily, weekly, monthly };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const inStats = calculateStats(incoming);
  const outStats = calculateStats(outgoing);

  const ReportCard = ({ title, inQty, outQty }) => (
    <div className="bg-slate-900 rounded-xl shadow-2xl border border-slate-800 overflow-hidden transition-transform hover:scale-[1.02]">
      <div className="bg-slate-950/50 p-4 border-b border-slate-800">
        <h3 className="text-xl font-semibold text-slate-100 text-center">{title} Report</h3>
      </div>
      <div className="p-6 grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <p className="text-emerald-400 text-sm font-medium mb-1">Incoming</p>
          <p className="text-3xl font-bold text-slate-100">+{inQty}</p>
        </div>
        <div className="text-center p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
          <p className="text-rose-400 text-sm font-medium mb-1">Outgoing</p>
          <p className="text-3xl font-bold text-slate-100">-{outQty}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="text-3xl font-bold text-slate-100">Stock Reports</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard title="Daily (Today)" inQty={inStats.daily} outQty={outStats.daily} />
        <ReportCard title="Weekly (This Week)" inQty={inStats.weekly} outQty={outStats.weekly} />
        <ReportCard title="Monthly (This Month)" inQty={inStats.monthly} outQty={outStats.monthly} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-950/50 p-4 border-b border-slate-800">
             <h3 className="text-lg font-semibold text-emerald-400">Recent Incoming</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left">
              <thead className="bg-slate-900 sticky top-0">
                <tr className="text-slate-400 text-xs uppercase">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {incoming.slice(0, 10).map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/50 text-sm">
                    <td className="px-4 py-3 text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-200">{item.product_name}</td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">+{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="bg-slate-950/50 p-4 border-b border-slate-800">
             <h3 className="text-lg font-semibold text-rose-400">Recent Outgoing</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left">
              <thead className="bg-slate-900 sticky top-0">
                <tr className="text-slate-400 text-xs uppercase">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {outgoing.slice(0, 10).map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/50 text-sm">
                    <td className="px-4 py-3 text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-200">{item.product_name}</td>
                    <td className="px-4 py-3 text-rose-400 font-medium">-{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
