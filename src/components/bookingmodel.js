import React, { useState } from "react";

export default function BookingModal({ spot, onClose, onConfirmBook, onCheckout }) {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [hours, setHours] = useState(1);

  if (!spot) return null;

  const isVacant = spot.status === "VACANT";
  const estimatedFare = (hours * spot.rate).toFixed(2);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold">{spot.floor} - {spot.id}</h3>
            <p className="text-xs text-slate-400 capitalize">Type: {spot.type}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isVacant ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-rose-950 text-rose-400 border border-rose-800"}`}>
            {spot.status}
          </span>
        </div>

        {isVacant ? (
          <form onSubmit={(e) => { e.preventDefault(); onConfirmBook(spot.id, { vehicleNumber, hours }); }} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Vehicle License Plate</label>
              <input
                type="text"
                required
                placeholder="e.g. KA-01-AB-1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Expected Duration (Hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-between items-center py-2 px-3 bg-slate-950/60 rounded-xl border border-slate-800 text-sm">
              <span className="text-slate-400">Total Estimated Fare:</span>
              <span className="font-bold text-indigo-400">${estimatedFare}</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Parked Since:</span>
                <span className="text-slate-200">{spot.parkedSince || spot.lastUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vehicle No:</span>
                <span className="text-slate-200 font-mono">{spot.vehicleNumber || "KA-01-XX-9999"}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => onCheckout(spot.id)}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-sm font-semibold transition"
              >
                Check Out / Release
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}