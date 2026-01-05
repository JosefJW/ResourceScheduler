// src/pages/NotFound.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-pink-100 via-yellow-100 to-green-100 p-6">
      {/* Left side */}
      <div className="flex-1 flex flex-col justify-center items-center md:items-center">
        <div className="text-center md:text-center">
          <h1 className="text-9xl font-extrabold text-purple-500 mb-4 animate-bounce">
            404
          </h1>
          <p className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-6">
            Page not found
          </p>
          <motion.button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 text-white font-bold rounded-3xl shadow-lg text-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go Home
          </motion.button>
        </div>
      </div>

      {/* Right side */}
      <motion.div
        className="flex-1 flex justify-center items-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
      >
        <img
          src="/src/assets/grabbit-rabbit-surprise.png"
          alt="Grabbit surprised"
          className="w-80 h-80 object-contain"
        />
      </motion.div>
    </div>
  );
}
