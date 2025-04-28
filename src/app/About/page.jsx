'use client';

import { useRouter } from "next/navigation";
import Button from "../components/button"; // adjust this if your Button is elsewhere

export default function About() {
  const router = useRouter();

  const handleSignout = () => {
    // simulate clearing auth, then redirect
    router.push('/');
  };

  return (
    <>
      {/* Header */}
      <header className="w-full px-3 py-2 bg-gray-500 text-white shadow-md flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold tracking-wide">SensorFlow</h2>
        <Button
          onClick={handleSignout}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-medium"
        >
          Signout
        </Button>
      </header>

      {/* Main Content */}
      <main
  className="relative min-h-screen text-white px-2 py-6 space-y-6 bg-[url('https://img.freepik.com/free-photo/smart-farming-with-agriculture-iot_53876-124634.jpg?t=st=1745497581~exp=1745501181~hmac=b136615ee79bef494fa880ef0d01ffe8d01803f8dacd746f4427310d7571b7b2&w=1380')] bg-cover bg-center bg-no-repeat"
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/60 z-0" />

  {/* Content */}
  <div className="relative z-10">
    <div className="text-center space-y-4">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent drop-shadow-xl">
        About the Project
      </h1>
      <p className="text-lg text-gray-100 max-w-2xl mx-auto leading-relaxed">
        A next-gen solution combining IoT and agriculture to enhance decision-making, boost efficiency,
        and enable sustainable farming practices.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center max-w-6xl mx-auto mt-10">
      {/* Text Block */}
      <div className="space-y-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg text-gray-100">
        <h2 className="text-2xl font-bold text-green-300">What is Smart Agriculture?</h2>
        <p className="text-gray-200 text-lg leading-relaxed">
          This project leverages IoT-based sensors to monitor real-time environmental conditions such as soil moisture, humidity, and temperature.
          Data is continuously collected and analyzed to support precision farming. This allows farmers to make informed decisions, optimize resource
          usage, and increase crop yields while reducing environmental impact.
        </p>
        <p className="text-gray-200 text-md">
          The system includes low-power wireless sensors, cloud-based data storage, and intelligent dashboards for visualization. Designed for scalability,
          it brings modern digital transformation to traditional farming landscapes.
        </p>
      </div>

      {/* Image Block */}
      <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        <img
          src="https://img.freepik.com/premium-photo/indoor-organic-hydroponic-fresh-green-lettuce-vegetables-produce-greenhouse-garden-nursery-farm-with-visual-icon-agriculture-business-smart-farming-digital-technology-healthy-food-concept_33829-287.jpg?w=1380"
          alt="Smart Agriculture Overview"
          className="w-full h-[400px] object-cover rounded-3xl"
        />
      </div>
    </div>
  </div>
</main>


      {/* Footer */}
      <footer className="text-center p-4 border-t border-white/10 bg-black/80 text-sm text-white/70">
        © 2025 SensorFlow. All rights reserved.
      </footer>
    </>
  );
}