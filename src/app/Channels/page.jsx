'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Button from '../components/button';

export default function ChannelsPage() {
  const router = useRouter();
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState('');
  const [expandedChannel, setExpandedChannel] = useState(null);

  // Fetch channels from backend
  const fetchChannels = async () => {
    try {
      const res = await axios.get(`https://sensor-server-7aqg.onrender.com/channels`, { 
        withCredentials: true 
      });
      setChannels(res.data.channels || []);
    } catch (error) {
      console.error("Failed to fetch channels:", error);
      alert("Failed to load channels. Check console for details.");
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  // Toggle API key visibility
  const toggleApiKey = (channelId) => {
    setExpandedChannel(expandedChannel === channelId ? null : channelId);
  };

  // ✅ Create a new channel with success alert
  const handleCreateChannel = async () => {
    if (!newChannel.trim()) {
      alert("Please enter a channel name");
      return;
    }
    try {
      await axios.post(`https://sensor-server-7aqg.onrender.com/channels`, {
        name: newChannel.trim()
      }, { withCredentials: true });
      
      setNewChannel('');
      await fetchChannels(); // Wait for refresh before showing alert
      alert(`Channel "${newChannel.trim()}" created successfully!`);
    } catch (error) {
      console.error("Error creating channel:", error);
      alert("Failed to create channel. Please try again.");
    }
  };

  // ✅ Delete a channel with confirmation + success alert
  const handleDelete = async (id) => {
    const channelToDelete = channels.find(c => c._id === id);
    if (!channelToDelete) return;

    if (!confirm(`Are you sure you want to delete "${channelToDelete.name}"?`)) {
      return; // User cancelled
    }

    try {
      await axios.delete(`https://sensor-server-7aqg.onrender.com/channels/${id}`, { 
        withCredentials: true 
      });
      await fetchChannels(); // Wait for refresh before showing alert
      alert(`Channel "${channelToDelete.name}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting channel:", error);
      alert("Failed to delete channel. Please try again.");
    }
  };

  const handleSignout = () => {
    // Add any signout logic here (e.g., clearing tokens/cookies)
    router.push('/'); // Redirect to home
  };


  return (
    
    <div className="min-h-screen bg-[url('https://img.freepik.com/free-photo/smart-farming-technology-agriculture-concept_53876-124636.jpg?t=st=1745504992~exp=1745508592~hmac=ca8a2a0db37292d702527b5fd6c83b471e3f548a4d3210c9fbd1842d2322d1ae')] bg-cover bg-center bg-no-repeat text-white">
     {/* Header with Signout */}
     <header className="w-full px-3 py-2 bg-gray-800 text-white shadow-md flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-wide">SensorFlow</h2>
        <Button
          onClick={handleSignout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium"
        >
          Sign Out
        </Button>
      </header>

       
      <div className="backdrop-brightness-50 min-h-screen p-8 space-y-10">
        <h1 className="text-4xl font-extrabold text-center drop-shadow-md text-lime-300">
          Manage Your Channels
        </h1>

        {/* Create Channel Section (unchanged) */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-md space-y-4">
          <input
            type="text"
            value={newChannel}
            onChange={(e) => setNewChannel(e.target.value)}
            placeholder="Enter channel name"
            className="w-full p-3 text-gray-900 rounded-lg outline-none border border-gray-300 focus:border-green-500"
          />
          <Button onClick={handleCreateChannel}>Create Channel</Button>
        </div>

        {/* Updated Channel List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {channels.length === 0 ? (
            <p className="text-center text-white/80">No channels found.</p>
          ) : (
            channels.map((channel) => (
              <div
                key={channel._id}
                className="flex flex-col bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-md hover:bg-white/20 transition"
              >
                <div className="flex justify-between items-center">
                  <span
                    onClick={() => toggleApiKey(channel._id)} // Changed from router.push
                    className="cursor-pointer font-medium text-lg hover:text-green-300"
                  >
                    {channel.name}
                  </span>
                  <Button 
                    onClick={() => handleDelete(channel._id)} 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </Button>
                </div>

                {/* Dropdown for API Key */}
                {expandedChannel === channel._id && (
                  <div className="mt-3 p-3 bg-black/20 rounded-lg">
                    <p className="text-sm font-mono break-all">Channel ID: {channel.apiKey}</p>
                    <Button 
                      onClick={() => navigator.clipboard.writeText(channel.apiKey)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-sm py-1 px-2"
                    >
                      Copy
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}