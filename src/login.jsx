import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Fetch existing registered users from browser storage
    const savedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');

    if (isSignUp) {
      // 1. REGISTER ACCOUNT LOGIC
      const userExists = savedUsers.some((u) => u.email.toLowerCase() === formData.email.toLowerCase());

      if (userExists) {
        setError('An account with this email already exists! Please Sign In.');
        return;
      }

      const newUser = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      savedUsers.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(savedUsers));

      setSuccessMsg('Account created successfully! Please Sign In now.');
      setIsSignUp(false); // Automatically switch to Sign In tab
      setFormData({ name: '', email: formData.email, password: '', role: 'user' });

    } else {
      // 2. SIGN IN / LOGIN LOGIC
      const foundUser = savedUsers.find(
        (u) => u.email.toLowerCase() === formData.email.toLowerCase()
      );

      if (!foundUser) {
        setError('No account found with this email. Please Create an Account first.');
        return;
      }

      if (foundUser.password !== formData.password) {
        setError('Incorrect password! Please try again.');
        return;
      }

      // Authentication Successful
      onLoginSuccess(foundUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Logo & Heading */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-indigo-600/30 mb-3">
            P
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ParkSpace Pro</h1>
          <p className="text-xs text-slate-400 mt-1">IoT Parking Space Detection & Dynamic Fares</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6 text-sm">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              !isSignUp ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              isSignUp ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs">
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="user@nitk.edu.in"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Account Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="user">Driver / User</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 transition duration-150"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}