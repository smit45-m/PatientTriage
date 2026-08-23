'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import GlassCard from './GlassCard';

const data = [
  { name: 'ESI 1', value: 5, color: '#ef4444' },
  { name: 'ESI 2', value: 25, color: '#f97316' },
  { name: 'ESI 3', value: 45, color: '#eab308' },
  { name: 'ESI 4', value: 15, color: '#22c55e' },
  { name: 'ESI 5', value: 10, color: '#3b82f6' },
];

export default function AuditDashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">AI Audit & Performance</h2>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <GlassCard className="p-6">
          <h3 className="text-gray-400 text-sm mb-4">ESI Distribution (Last 24h)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0a0a1a', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        
        <GlassCard className="p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-gray-400 text-sm mb-2">AI-Human Agreement</h3>
          <p className="text-5xl font-black text-green-400">94.2%</p>
          <p className="text-xs text-gray-500 mt-2">+1.2% from last week</p>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-gray-400 text-sm mb-2">Override Rate</h3>
          <p className="text-5xl font-black text-yellow-400">5.8%</p>
          <p className="text-xs text-gray-500 mt-2">Top override: ESI 3 → 2</p>
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <h3 className="text-gray-400 text-sm font-bold mb-4">Recent Overrides</h3>
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-darker text-gray-400">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Patient ID</th>
              <th className="p-3">AI ESI</th>
              <th className="p-3">Final ESI</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Nurse ID</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800/50">
              <td className="p-3">10:42 AM</td>
              <td className="p-3">P008</td>
              <td className="p-3 text-yellow-400">3</td>
              <td className="p-3 text-orange-400 font-bold">2</td>
              <td className="p-3">Patient looks worse than vitals suggest</td>
              <td className="p-3">RN-4492</td>
            </tr>
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
