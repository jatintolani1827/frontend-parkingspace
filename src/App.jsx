import React, { useState, useEffect } from 'react';
import Login from './Login';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); // User auth state
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'fares' | 'history' | 'users'
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [filterType, setFilterType] = useState('all');

  // Backend Data States (Initial mock data as fallback)
  const [parkingSpots, setParkingSpots] = useState([
    { id: 1, spot_number: 'A-01', floor: 1, is_occupied: false, spot_type: 'car', last_updated: 'Just now' },
    { id: 2, spot_number: 'A-02', floor: 1, is_occupied: true, spot_type: 'car', last_updated: '2 mins ago' },
  ]);

  const [fareRules, setFareRules] = useState([
    { vehicle_type: 'car', base_rate: 4.00, peak_multiplier: 1.25 },
    { vehicle_type: 'ev', base_rate: 3.50, peak_multiplier: 1.10 },
    { vehicle_type: 'motorcycle', base_rate: 2.00, peak_multiplier: 1.00 },
    { vehicle_type: 'van', base_rate: 6.00, peak_multiplier: 1.50 },
  ]);

  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);

  // --- HELPER: Get Auth Headers for API Calls ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // --- Real-time polling from FastAPI Backend (Live Spots) ---
 // --- Real-time polling from FastAPI Backend (Live Spots) ---
  useEffect(() => {
    if (!currentUser) return;

    const fetchSpots = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/parking/', {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const rawData = await res.json();
          // Map backend column names to the frontend's expected state
          const formattedSpots = rawData.map(spot => ({
            id: spot.parking_id || spot.id,
            spot_number: spot.slot_number || spot.spot_number || "N/A",
            floor: spot.location || spot.floor || "1",
            is_occupied: spot.status === "occupied" || spot.is_occupied === true,
            spot_type: spot.spot_type || "car",
            last_updated: spot.last_updated || "Just now"
          }));
          setParkingSpots(formattedSpots);
        }
      } catch (err) {
        console.warn("Backend offline, using fallback spots.");
      }
    };

    fetchSpots();
    const interval = setInterval(fetchSpots, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // --- Fetch History & Users dynamically when tabs change ---
  useEffect(() => {
    if (!currentUser) return;

    const fetchTabData = async () => {
      try {
        if (activeTab === 'history') {
          const res = await fetch('http://127.0.0.1:8000/parking/history', { headers: getAuthHeaders() });
          if (res.ok) setHistory(await res.json());
        } else if (activeTab === 'users' && role === 'admin') {
          const res = await fetch('http://127.0.0.1:8000/auth/users', { headers: getAuthHeaders() });
          if (res.ok) setUsers(await res.json());
        }
      } catch (err) {
        console.warn(`Failed to fetch data for ${activeTab} tab.`);
      }
    };

    fetchTabData();
  }, [activeTab, currentUser, role]);

  // --- Authentication Handlers ---
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setRole(user.role || 'user');
    // Save JWT token provided by FastAPI
    if (user.access_token) {
      localStorage.setItem('access_token', user.access_token);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('live');
    localStorage.removeItem('access_token'); // Clear token
  };

  // --- Reserve/Vacate Action Handler ---
  const toggleSpotStatus = async (spot, targetStatus) => {
    // Optimistic UI Update
    setParkingSpots((prev) =>
      prev.map((s) => (s.id === spot.id ? { ...s, is_occupied: targetStatus, last_updated: 'Just now' } : s))
    );

    try {
      await fetch(`http://127.0.0.1:8000/parking/${spot.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), // Include JWT Token
        },
        body: JSON.stringify({ is_occupied: targetStatus }),
      });
    } catch {
      console.warn("Status update failed to sync with backend.");
    }

    setSelectedSpot(null);
  };

  // Compute metrics
  const occupiedCount = parkingSpots.filter((s) => s.is_occupied).length;
  const occupancyRate = Math.round((occupiedCount / (parkingSpots.length || 1)) * 100);

  // Dynamic rate calculator
  const getDynamicRate = (type) => {
    const rule = fareRules.find((f) => f.vehicle_type === type) || fareRules[0];
    const multiplier = occupancyRate > 70 ? rule.peak_multiplier : 1.0;
    return (rule.base_rate * multiplier).toFixed(2);
  };

  // Filtered parking spots
  const filteredSpots = parkingSpots.filter((s) => {
    if (filterType === 'vacant') return !s.is_occupied;
    if (filterType === 'occupied') return s.is_occupied;
    if (filterType !== 'all') return s.spot_type === filterType;
    return true;
  });

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-600/30">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                ParkSpace Pro
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Live System
                </span>
              </h1>
              <p className="text-xs text-slate-400">IoT Parking Detection & Dynamic Fares (SRS IT303)</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-sm">
            <button
              onClick={() => setActiveTab('live')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'live' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Floor Map
            </button>
            <button
              onClick={() => setActiveTab('fares')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'fares' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Smart Fares
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              History
            </button>
            {role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`px-3.5 py-1.5 rounded-lg transition ${
                  activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Users
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{currentUser.name}</p>
              <p className="text-[10px] text-indigo-400 uppercase font-semibold">{role} Mode</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 border border-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Total Capacity</p>
            <p className="text-2xl font-bold mt-1 text-white">{parkingSpots.length} Slots</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Available Spots</p>
            <p className="text-2xl font-bold mt-1 text-emerald-400">
              {parkingSpots.length - occupiedCount} Vacant
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Facility Occupancy Rate</p>
            <p className="text-2xl font-bold mt-1 text-amber-400">{occupancyRate}% Occupied</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Smart Dynamic Rate</p>
            <p className="text-2xl font-bold mt-1 text-indigo-400">
              ${(3.50 * (occupancyRate > 70 ? 1.25 : 1.0)).toFixed(2)} / hr
            </p>
          </div>
        </div>

        {/* TAB 1: LIVE FLOOR MAP */}
        {activeTab === 'live' && (
          <section>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-slate-100">Live Parking Grid View</h2>
              <div className="flex flex-wrap gap-2">
                {['all', 'vacant', 'occupied', 'car', 'ev', 'motorcycle', 'van'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize border transition ${
                      filterType === type
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredSpots.map((spot) => (
                <div
                  key={spot.id}
                  onClick={() => setSelectedSpot(spot)}
                  className={`p-5 rounded-2xl border transition hover:scale-[1.02] cursor-pointer ${
                    spot.is_occupied
                      ? 'bg-rose-950/20 border-rose-800/50 hover:border-rose-600'
                      : 'bg-emerald-950/20 border-emerald-800/50 hover:border-emerald-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Floor {spot.floor}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-0.5">{spot.spot_number}</h3>
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                        spot.is_occupied
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {spot.is_occupied ? 'Occupied' : 'Vacant'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800">
                    <span className="capitalize">Type: {spot.spot_type}</span>
                    <span>{spot.last_updated}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: SMART FARES */}
        {activeTab === 'fares' && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-white">Smart Meter Fare Pricing Configuration</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="p-3">Vehicle Type</th>
                    <th className="p-3">Base Rate ($/hr)</th>
                    <th className="p-3">Peak Multiplier</th>
                    <th className="p-3">Effective Rate ($/hr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {fareRules.map((fare, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-white capitalize">{fare.vehicle_type}</td>
                      <td className="p-3">${fare.base_rate.toFixed(2)}</td>
                      <td className="p-3">{fare.peak_multiplier}x</td>
                      <td className="p-3 font-bold text-indigo-400">
                        ${(fare.base_rate * (occupancyRate > 70 ? fare.peak_multiplier : 1.0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-white">Parking Session History</h2>
            {history.length === 0 ? (
                <p className="text-slate-400 text-sm">No parking history found.</p>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                    <tr>
                        <th className="p-3">Driver</th>
                        <th className="p-3">Spot</th>
                        <th className="p-3">Vehicle Details</th>
                        <th className="p-3">Entry Time</th>
                        <th className="p-3">Total Fare</th>
                        <th className="p-3">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                    {history.map((log) => (
                        <tr key={log.id}>
                        <td className="p-3 font-medium text-white">{log.user}</td>
                        <td className="p-3">{log.spot}</td>
                        <td className="p-3">{log.vehicle}</td>
                        <td className="p-3">{log.entry_time}</td>
                        <td className="p-3 font-semibold text-emerald-400">{log.total_fare}</td>
                        <td className="p-3">
                            <span
                            className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                                log.status === 'Completed'
                                ? 'bg-slate-800 text-slate-300'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            }`}
                            >
                            {log.status}
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
          </section>
        )}

        {/* TAB 4: USERS (ADMIN ONLY) */}
        {activeTab === 'users' && role === 'admin' && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-white">Registered Users</h2>
            {users.length === 0 ? (
                 <p className="text-slate-400 text-sm">No users found.</p>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                    <tr>
                        <th className="p-3">User ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                    {users.map((u) => (
                        <tr key={u.user_id}>
                        <td className="p-3">#{u.user_id || u.id}</td>
                        <td className="p-3 font-medium text-white">{u.name}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">
                            <span className="capitalize text-xs bg-slate-800 px-2 py-0.5 rounded font-semibold text-indigo-300">
                            {u.role}
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
          </section>
        )}
      </main>

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold text-white mb-1">Spot Details: {selectedSpot.spot_number}</h3>
            <p className="text-xs text-slate-400 mb-4">Floor {selectedSpot.floor} • Type: {selectedSpot.spot_type}</p>

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Current Status:</span>
                <span className={`font-bold ${selectedSpot.is_occupied ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedSpot.is_occupied ? 'Occupied' : 'Vacant'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Dynamic Fare Rate:</span>
                <span className="font-bold text-indigo-400">
                  ${getDynamicRate(selectedSpot.spot_type)} / hour
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedSpot(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Close
              </button>
              {selectedSpot.is_occupied ? (
                <button
                  onClick={() => toggleSpotStatus(selectedSpot, false)}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition"
                >
                  Check Out
                </button>
              ) : (
                <button
                  onClick={() => toggleSpotStatus(selectedSpot, true)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"
                >
                  Reserve Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}