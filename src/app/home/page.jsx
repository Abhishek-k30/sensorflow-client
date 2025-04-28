'use client';

import { useRouter } from "next/navigation";
import { useAuthStore } from "../zustand/useAuthStore";
import Button from "../components/Button";
import { motion } from "framer-motion";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } }
};

export default function Home() {
  const router = useRouter();
  const { authName, updateAuthName } = useAuthStore();

  const isAuthenticated = !!authName;

  const handleProtectedRoute = (path) => {
    if (isAuthenticated) {
      router.push(path);
    } else {
      router.push(`/Signin?redirect=${encodeURIComponent(path)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-white bg-[url('https://plus.unsplash.com/premium_photo-1661900503280-36c1b4be3a66?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-no-repeat">
      <div className="backdrop-brightness-50 flex flex-col flex-grow">
        <div className="min-h-screen flex flex-col">
          <header className="p-3 bg-slate-500">
            <motion.div 
              initial="hidden"
              animate="show"
              variants={container}
              className="flex justify-between items-center flex-wrap"
            >
              <div className="flex flex-wrap gap-3">
                <motion.div variants={item}>
                  <Button>Home</Button>
                </motion.div>
                <motion.div variants={item}>
                  <Button onClick={() => handleProtectedRoute("/Dashboard")}>
                    Dashboard
                  </Button>
                </motion.div>
                <motion.div variants={item}>
                  <Button onClick={() => handleProtectedRoute("/Channels")}>
                    Channels
                  </Button>
                </motion.div>
                <motion.div variants={item}>
                  <Button onClick={() => router.push('/About')}>
                    About
                  </Button>
                </motion.div>
              </div>

              <div className="flex gap-3 mt-4 md:mt-0">
                {!isAuthenticated ? (
                  <motion.div variants={item}>
                    <Button onClick={() => router.push("/Signin")}>Signin</Button>
                  </motion.div>
                ) : (
                  <motion.div variants={item}>
                    <Button onClick={() => updateAuthName("")}>Signout</Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </header>

          <main className="flex-grow px-6 py-16 space-y-20">
            <motion.div 
              initial="hidden"
              animate="show"
              variants={fadeIn}
              className="text-center space-y-3"
            >
              <motion.h1 
                className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                Smart Agriculture Based Web Server
              </motion.h1>
              <motion.p 
                className="text-lg md:text-2xl text-white font-medium tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                variants={fadeIn}
              >
                National Institute of Technology Agartala
              </motion.p>
              <motion.p 
                className="text-lg md:text-2xl text-white font-medium tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                variants={fadeIn}
              >
                Department of Electronics and Communications Engineering (ECE)
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div 
                className="bg-white/20 backdrop-blur-md p-8 md:p-10 rounded-[1.75rem] border border-white/10 shadow-lg space-y-6 text-center md:text-left"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.h2 
                  className="text-xl md:text-3xl font-extrabold tracking-normal bg-gradient-to-r from-green-400 via-lime-500 to-yellow-400 bg-clip-text text-transparent whitespace-nowrap underline-offset-4 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
                  whileHover={{ scale: 1.03 }}
                >
                  Empowering Farmers with Technology
                </motion.h2>

                <motion.p 
                  className="text-white/90 text-lg leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Smart agriculture harnesses the power of IoT, advanced sensors,
                  and real-time data analytics to transform traditional farming
                  practices. By continuously monitoring soil moisture, temperature,
                  nutrient levels, and environmental conditions, farmers can make data-driven
                  decisions that enhance crop productivity, minimize waste, and promote sustainability.
                  These technologies enable precision farming — optimizing irrigation, fertilization,
                  and pest control — to maximize yields, reduce costs, and support resilient
                  agricultural ecosystems
                </motion.p>
              </motion.div>

              <motion.div 
                className="relative w-full max-w-3xl mx-auto rounded-[2rem] overflow-hidden shadow-md border border-white/10"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/30 to-black/70 rounded-[2rem] z-10 mix-blend-overlay pointer-events-none" />

                <motion.img
                  src="https://img.freepik.com/free-photo/agricultural-robots-work-smart-farms_35913-3364.jpg?t=st=1745484442~exp=1745488042~hmac=6aded4b859ffad6c196c31172d945c999dabccf18045c91fb435cc297b4f78e3&w=1380"
                  alt="Smart Agriculture Technology"
                  className="w-full h-[300px] object-cover rounded-[2rem]"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                />
              </motion.div>
            </div>
          </main>

          <motion.footer 
            className="text-center p-4 border-t border-gray-700 text-sm text-black bg-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            © 2025 SensorFlow. All rights reserved.
          </motion.footer>
        </div>
      </div>
    </div>
  );
}