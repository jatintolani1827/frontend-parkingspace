import React from "react";

export default function History({ historyLogs = [] }) {
  const dummyLogs = [
    { id: "LOG-01", spotId: "A-01", vehicle: "KA-05-MC-1020", duration: "2h 15m", amount: "$7.88", date: "Just now", status: "COMPLETED" },
    { id: "LOG-02", spotId: "EV-01", vehicle: "KA-01-EQ-5001", duration: "1h 45m", amount: "$8.75", date: "2 hours ago", status: "COMPLETED" },
    { id: "LOG-03", spotId: "M-01", vehicle: "KA-03-HA-8821", duration: "4h 00m", amount: "$6.00", date: "Yesterday", status: "COMPLETED" },
  ];

  const logs = historyLogs.length > 0 ? historyLogs : dummyLogs;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Parking Session History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-xs uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Session ID</th>
              <th className="py-3 px-4">Spot ID</th>
              <th className="py-3 px-4">Vehicle No</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-800/30">
                <td className="py-3 px-4 font-mono text-xs text-indigo-400">{log.id}</td>
                <td className="py-3 px-4 font-semibold text-slate-200">{log.spotId}</td>
                <td className="py-3 px-4 font-mono text-xs">{log.vehicle}</td>
                <td className="py-3 px-4">{log.duration}</td>
                <td className="py-3 px-4 font-bold text-emerald-400">{log.amount}</td>
                <td className="py-3 px-4 text-xs text-slate-400">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}