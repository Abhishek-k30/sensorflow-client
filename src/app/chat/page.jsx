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

const DataViewer = () => {
  const [view, setView] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [date, setDate] = useState('');
  const [data, setData] = useState([]);

  const handleSubmit = async () => {
    try {
      const res = await axios.get('https://localhost:5000/api/sensors/data', {
        params: { apiKey } // This becomes ?apiKey=xyz
      });
      setData(res.data);
    } catch (error) {
      console.error("Failed to fetch data:", error?.response?.data || error.message);
    }
  };

  const renderTable = () => (
    <div className="overflow-auto rounded-xl shadow-md">
      <table className="min-w-full text-sm text-left border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">Temp</th>
            <th className="px-4 py-2">Humidity</th>
            <th className="px-4 py-2">Moisture</th>
            <th className="px-4 py-2">NPK</th>
            <th className="px-4 py-2">pH</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => {
            const [entryDate, entryTime] = entry.date.split('T');
            return (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{entryDate}</td>
                <td className="px-4 py-2">{entryTime?.slice(0, 5)}</td>
                <td className="px-4 py-2">{entry.temp}</td>
                <td className="px-4 py-2">{entry.humidity}</td>
                <td className="px-4 py-2">{entry.moisture}</td>
                <td className="px-4 py-2">{entry.npk}</td>
                <td className="px-4 py-2">{entry.ph}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderSingleGraph = (key, color) => (
    <div className="bg-white p-4 rounded-2xl shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">{key.toUpperCase()}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="date" tickFormatter={(value) => value.split('T')[1]?.slice(0, 5)} />
          <YAxis />
          <Tooltip labelFormatter={(label) => label.replace('T', ' ').slice(0, 16)} />
          <Legend />
          <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView('table')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow"
        >
          View Table
        </button>
        <button
          onClick={() => setView('graph')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow"
        >
          View Graphs
        </button>
      </div>

      {view && (
        <div className="grid gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow w-fit"
          >
            Submit
          </button>
        </div>
      )}

      {data.length > 0 && (
        <div className="space-y-8">
          {view === 'table'
            ? renderTable()
            : (
              <>
                {renderSingleGraph("temperature", "#8884d8")}
                {renderSingleGraph("humidity", "#82ca9d")}
                {renderSingleGraph("moisture", "#ffc658")}
                {renderSingleGraph("npk", "#ff7300")}
                {renderSingleGraph("ph", "#0088FE")}
              </>
            )}
        </div>
      )}
    </div>
  );
};

export default DataViewer;