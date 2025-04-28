"use client";
import React, { useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';

const DataViewer = () => {
  const [view, setView] = useState('graph');
  const [apiKey, setApiKey] = useState('');
  const [channelID, setChannelID] = useState('');
  const [date, setDate] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!apiKey) {
      setError('API Key is required');
      return;
    }

    if (channelID !== "1111") {
      setError('Invalid API Key. Please enter correct API Key.');
      alert('Invalid API Key. Please enter correct API Key.');
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.get('http://localhost:5000/api/sensors/data', {
        params: { 
          apiKey,
          date: date || undefined
        },
        timeout: 10000
      });
      
      // Process data to properly combine date and time
      const processedData = res.data.map(item => {
        const datetime = new Date(`${item.date}T${item.time}`);
        const istTime = new Date(datetime.getTime() + (5.5 * 60 * 60 * 1000));
        const displayTime = istTime.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).replace(/^24:/, '00:');
        
        return {
          ...item,
          datetime: istTime.toISOString(),
          displayDate: item.date,
          displayTime: displayTime,
          fullDateTime: istTime.toLocaleString('en-IN'),
          // Calculate NPK as sum for backward compatibility
          npk: (item.n || 0) + (item.p || 0) + (item.k || 0)
        };
      }).sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
      
      setData(processedData);
    } catch (error) {
      let errorMessage = "Failed to fetch data";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Request timeout - server is not responding";
      } else if (error.response) {
        errorMessage = error.response.data?.message || 
                      `Server responded with ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "No response from server - is it running?";
      } else {
        errorMessage = error.message;
      }
      
      console.error("API Error:", error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (data.length > 0) {
      handleSubmit();
    }
  };

  const exportToCSV = () => {
    if (data.length === 0) return;
    
    const headers = ['Date', 'Time', 'Temperature', 'Humidity', 'Moisture', 'N', 'P', 'K', 'pH'];
    const csvRows = [
      headers.join(','),
      ...data.map(item => [
        item.displayDate,
        item.displayTime,
        item.temperature,
        item.humidity,
        item.moisture,
        item.n || '',
        item.p || '',
        item.k || '',
        item.ph
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sensor-data-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTable = () => {
    // Helper functions for N, P, K classification
    const getNValueClass = (value) => {
      if (value === null || value === undefined) return { className: '', tooltip: '' };
      if (value >= 30 && value <= 100) return { className: 'bg-green-50 text-green-800 border-l-4 border-green-500', tooltip: 'Optimal N (30-100 ppm)' };
      if ((value >= 20 && value < 30) || (value > 100 && value <= 150)) return { className: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500', tooltip: 'Suboptimal N (20-30 or 100-150 ppm)' };
      return { className: 'bg-red-50 text-red-800 border-l-4 border-red-500', tooltip: 'Dangerous N (<20 or >150 ppm)' };
    };

    const getPValueClass = (value) => {
      if (value === null || value === undefined) return { className: '', tooltip: '' };
      if (value >= 15 && value <= 60) return { className: 'bg-green-50 text-green-800 border-l-4 border-green-500', tooltip: 'Optimal P (15-60 ppm)' };
      if ((value >= 10 && value < 15) || (value > 60 && value <= 80)) return { className: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500', tooltip: 'Suboptimal P (10-15 or 60-80 ppm)' };
      return { className: 'bg-red-50 text-red-800 border-l-4 border-red-500', tooltip: 'Dangerous P (<10 or >80 ppm)' };
    };

    const getKValueClass = (value) => {
      if (value === null || value === undefined) return { className: '', tooltip: '' };
      if (value >= 50 && value <= 200) return { className: 'bg-green-50 text-green-800 border-l-4 border-green-500', tooltip: 'Optimal K (50-200 ppm)' };
      if ((value >= 30 && value < 50) || (value > 200 && value <= 250)) return { className: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500', tooltip: 'Suboptimal K (30-50 or 200-250 ppm)' };
      return { className: 'bg-red-50 text-red-800 border-l-4 border-red-500', tooltip: 'Dangerous K (<30 or >250 ppm)' };
    };

    // Existing classification for other parameters
    const getValueClass = (type, value) => {
      if (value === null || value === undefined) return { className: '', tooltip: '' };
      
      switch(type) {
        case 'temperature':
          if (value <= 30) return { className: 'bg-green-50 text-green-800 border-l-4 border-green-500', tooltip: 'Optimal (15°C - 30°C)' };
          if (value <= 35) return { className: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500', tooltip: 'Suboptimal (30°C - 35°C)' };
          return { className: 'bg-red-50 text-red-800 border-l-4 border-red-500', tooltip: 'Dangerous (>35°C)' };
        
        case 'humidity':
          if (value >= 50 && value <= 80) return { className: 'bg-green-50 text-green-800 border-l-4 border-green-500', tooltip: 'Optimal (50% - 80%)' };
          if ((value >= 40 && value < 50) || (value > 80 && value <= 85)) return { className: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500', tooltip: 'Suboptimal (40%-50% or 80%-85%)' };
          return { className: 'bg-red-50 text-red-800 border-l-4 border-red-500', tooltip: 'Dangerous (<40% or >85%)' };
        
        case 'moisture':
          if (value >= 20 && value <= 60) return { className: 'bg-green-50 text-green-800 border-l-4 border-green-500', tooltip: 'Optimal (20% - 60%)' };
          if ((value >= 10 && value < 20) || (value > 60 && value <= 70)) return { className: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500', tooltip: 'Suboptimal (10%-20% or 60%-70%)' };
          return { className: 'bg-red-50 text-red-800 border-l-4 border-red-500', tooltip: 'Dangerous (<10% or >70%)' };
        
        case 'ph':
          if (value >= 6.0 && value <= 7.0) return { className: 'bg-green-50 text-green-800 border-l-4 border-green-500', tooltip: 'Optimal (6.0 - 7.0)' };
          if ((value >= 5.5 && value < 6.0) || (value > 7.0 && value <= 7.5)) return { className: 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500', tooltip: 'Suboptimal (5.5-6.0 or 7.0-7.5)' };
          return { className: 'bg-red-50 text-red-800 border-l-4 border-red-500', tooltip: 'Dangerous (<5.5 or >7.5)' };
        
        default:
          return { className: '', tooltip: '' };
      }
    };
  
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-auto rounded-xl shadow-lg border border-gray-200 bg-white"
      >
        {/* Header with Info */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Sensor Data Analysis</h3>
            <p className="text-sm text-gray-500 mt-1">Color-coded values based on optimal agricultural ranges</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center px-3 py-1 rounded-full bg-green-50 border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs font-medium text-green-800">Optimal</span>
            </div>
            <div className="flex items-center px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-xs font-medium text-yellow-800">Suboptimal</span>
            </div>
            <div className="flex items-center px-3 py-1 rounded-full bg-red-50 border border-red-200">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs font-medium text-red-800">Dangerous</span>
            </div>
          </div>
        </div>
  
        {/* Table with Enhanced Styling */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature (°C)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity (%)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moisture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N (ppm)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P (ppm)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">K (ppm)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">pH</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((entry, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.displayDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {entry.displayTime}
                  </td>
                  
                  {/* Temperature */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium relative group ${
                    getValueClass('temperature', entry.temperature).className
                  }`}>
                    <div className="flex items-center">
                      {entry.temperature}
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute z-10 hidden group-hover:block w-64 px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg -left-2 -top-10">
                          {getValueClass('temperature', entry.temperature).tooltip}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Humidity */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium relative group ${
                    getValueClass('humidity', entry.humidity).className
                  }`}>
                    <div className="flex items-center">
                      {entry.humidity}
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute z-10 hidden group-hover:block w-64 px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg -left-2 -top-10">
                          {getValueClass('humidity', entry.humidity).tooltip}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Moisture */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium relative group ${
                    getValueClass('moisture', entry.moisture).className
                  }`}>
                    <div className="flex items-center">
                      {entry.moisture}
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute z-10 hidden group-hover:block w-64 px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg -left-2 -top-10">
                          {getValueClass('moisture', entry.moisture).tooltip}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Nitrogen (N) */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium relative group ${
                    getNValueClass(entry.n).className
                  }`}>
                    <div className="flex items-center">
                      {entry.n}
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute z-10 hidden group-hover:block w-64 px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg -left-2 -top-10">
                          {getNValueClass(entry.n).tooltip}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Phosphorus (P) */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium relative group ${
                    getPValueClass(entry.p).className
                  }`}>
                    <div className="flex items-center">
                      {entry.p}
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute z-10 hidden group-hover:block w-64 px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg -left-2 -top-10">
                          {getPValueClass(entry.p).tooltip}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Potassium (K) */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium relative group ${
                    getKValueClass(entry.k).className
                  }`}>
                    <div className="flex items-center">
                      {entry.k}
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute z-10 hidden group-hover:block w-64 px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg -left-2 -top-10">
                          {getKValueClass(entry.k).tooltip}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  {/* pH */}
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium relative group ${
                    getValueClass('ph', entry.ph).className
                  }`}>
                    <div className="flex items-center">
                      {entry.ph}
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute z-10 hidden group-hover:block w-64 px-3 py-2 text-xs text-gray-600 bg-white border border-gray-200 rounded-lg shadow-lg -left-2 -top-10">
                          {getValueClass('ph', entry.ph).tooltip}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        {/* Footer with Stats */}
        {data.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
            <div>Showing {data.length} records</div>
            <div>Last updated: {new Date().toLocaleString()}</div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderSingleGraph = (key, color, label) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{label}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis 
            dataKey="displayTime"
            tick={{ fontSize: 12, fill: "#111827" }}
            stroke="#111827"
            label={{ 
              value: 'Time', 
              position: 'insideBottomRight', 
              offset: -5,
              fill: "#111827"
            }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: "#111827" }}
            stroke="#111827"
            label={{ 
              value: key === 'temperature' ? '°C' : key === 'humidity' ? '%' : 'ppm',
              angle: -90,
              position: 'insideLeft',
              fill: "#111827"
            }}
          />
          <Tooltip 
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.96)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '12px',
              border: '1px solid #111827'
            }}
            formatter={(value) => [value, label]}
            labelFormatter={(value, payload) => {
              const item = payload[0]?.payload;
              return item ? `${item.displayDate} ${item.displayTime}` : value;
            }}
          />
          <Legend wrapperStyle={{ color: "#111827" }} />
          <Line 
            type="monotone" 
            dataKey={key}
            stroke="#111827"
            strokeWidth={2}
            dot={{ r: 4, fill: "#111827" }}
            activeDot={{ r: 6, fill: "#111827" }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Sensor Data Dashboard</h1>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('table')}
            className={`px-5 py-2.5 rounded-xl shadow flex items-center gap-2 ${
              view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Table View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('graph')}
            className={`px-5 py-2.5 rounded-xl shadow flex items-center gap-2 ${
              view === 'graph' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Graph View
          </motion.button>
          {data.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRefresh}
                disabled={loading}
                className="px-5 py-2.5 bg-white text-gray-700 rounded-xl shadow border border-gray-200 flex items-center gap-2"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportToCSV}
                className="px-5 py-2.5 bg-white text-gray-700 rounded-xl shadow border border-gray-200 flex items-center gap-2"
              >
                <FiDownload /> Export CSV
              </motion.button>
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel ID</label>
              <input
                placeholder="Enter your Channel ID"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                placeholder="Enter your API key"
                value={channelID}
                onChange={(e) => setChannelID(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:shadow-md w-full flex justify-center items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : 'Fetch Data'}
              </motion.button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
              {error}
            </div>
          )}
        </div>

        {loading && data.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-blue-500 rounded-full mb-4"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : data.length > 0 ? (
          <div className="space-y-6">
            {view === 'table' ? (
              renderTable()
            ) : (
              <>
                {renderSingleGraph("temperature", "#6366F1", "Temperature (°C)")}
                {renderSingleGraph("humidity", "#10B981", "Humidity (%)")}
                {renderSingleGraph("moisture", "#F59E0B", "Soil Moisture")}
                {renderSingleGraph("n", "#EF4444", "Nitrogen (N) Levels")}
                {renderSingleGraph("p", "#8B5CF6", "Phosphorus (P) Levels")}
                {renderSingleGraph("k", "#F97316", "Potassium (K) Levels")}
                {renderSingleGraph("ph", "#22D3EE", "pH Level")}
              </>
            )}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No data to display</h3>
              <p className="mt-1 text-sm text-gray-500">Fetch data using your API key to get started.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataViewer;