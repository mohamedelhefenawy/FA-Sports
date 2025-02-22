"use client"; // Ensure it's a client component

import Image from "next/image";
import { motion } from "framer-motion";
import logo from "../../public/c3879a1e-9ce2-4ca5-b201-50b645e32c03.jpg";

export default function Global() {
  return (
    <motion.div 
      className="mt-56 mx-auto w-[70%] flex flex-col gap-11"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Image src={logo} alt="logo" className="w-28 h-28 rounded-3xl" />
      </motion.div>

      <motion.div 
        className="flex flex-col gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <h3 className="text-2xl ml-3 text-white font-semibold">Soccer</h3>
        <h1 className="text-6xl text-white font-bold">Falcon AI</h1>
        <p className="text-gray-400 text-xl w-full font-medium">
          Falcon AI and the football community are always striving to discover and develop the next generation of elite players. That’s why we’ve built advanced virtual scouting programs right into the app.
        </p>
      </motion.div>
    </motion.div>
  );
}

