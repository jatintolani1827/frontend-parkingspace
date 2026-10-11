import React from "react";

export default function SmartFares({ baseRate, occupancyRate }) {
  const isHighDemand = occupancyRate > 75;
  const multiplier = isHighDemand ? 1.5 : occupancyRate > 50 ? 1.2 : 1.0;
  const currentFare = (baseRate * multiplier).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Dynamic Smart Pricing Engine</h2>
        <p className="text-sm text-slate-400 mb-6">
          Rates automatically adjust based on IoT sensor detection and real-time facility occupancy.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-500 font-medium">Standard Base Rate</span>
            <div className="text-2xl font-bold text-slate-200 mt-1">${baseRate.toFixed(2)} / hr</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-500 font-medium">Demand Multiplier</span>
            <div className={`text-2xl font-bold mt-1 ${isHighDemand ? "text-amber-400" : "text-emerald-400"}`}>
              {multiplier}x
            </div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-500 font-medium">Effective Dynamic Rate</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1">${currentFare} / hr</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-slate-200 mb-4">Pricing Breakdown by Vehicle Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: "Car", base: "$3.50/hr", ev: "No" },
            { type: "EV Spot", base: "$5.00/hr", ev: "Includes 22kW Fast Charging" },
            { type: "Motorcycle", base: "$1.50/hr", ev: "No" },
            { type: "Van / Heavy", base: "$4.50/hr", ev: "No" },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="font-bold text-slate-200">{item.type}</div>
              <div className="text-sm text-indigo-400 font-medium">{item.base}</div>
              <div className="text-xs text-slate-500">{item.ev}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}