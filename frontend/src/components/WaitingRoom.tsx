'use client';
import GlassCard from './GlassCard';
import ESIBadge from './ESIBadge';

export default function WaitingRoom() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Waiting Room Monitor</h2>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <GlassCard className="p-4 text-center"><h3 className="text-gray-400 text-sm">Total Waiting</h3><p className="text-3xl font-bold">14</p></GlassCard>
        <GlassCard className="p-4 text-center"><h3 className="text-gray-400 text-sm">Longest Wait</h3><p className="text-3xl font-bold text-red-400">1h 42m</p></GlassCard>
        <GlassCard className="p-4 text-center"><h3 className="text-gray-400 text-sm">ESI 2 Waiting</h3><p className="text-3xl font-bold text-orange-400">2</p></GlassCard>
        <GlassCard className="p-4 text-center"><h3 className="text-gray-400 text-sm">Avg Wait Time</h3><p className="text-3xl font-bold">45m</p></GlassCard>
      </div>
      
      <GlassCard className="p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface-darker/80 border-b border-gray-800">
            <tr>
              <th className="p-4 font-semibold text-gray-400">Patient</th>
              <th className="p-4 font-semibold text-gray-400">ESI Level</th>
              <th className="p-4 font-semibold text-gray-400">Wait Time</th>
              <th className="p-4 font-semibold text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
              <td className="p-4 font-medium text-white">Smith, J.</td>
              <td className="p-4"><ESIBadge esi={2} size="sm" /></td>
              <td className="p-4 text-red-400 font-bold">42m</td>
              <td className="p-4"><span className="px-2 py-1 bg-red-900/30 text-red-400 rounded text-xs">Exceeding Goal</span></td>
            </tr>
            <tr className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
              <td className="p-4 font-medium text-white">Doe, M.</td>
              <td className="p-4"><ESIBadge esi={3} size="sm" /></td>
              <td className="p-4 text-yellow-400">28m</td>
              <td className="p-4"><span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs">Approaching Goal</span></td>
            </tr>
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
