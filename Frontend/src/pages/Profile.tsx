import { useState } from "react";
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom";

export default function Profile() {
	// State for form fields
	const [username, setUsername] = useState("User123");
	const [email, setEmail] = useState("user@example.com");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const handleSave = () => {
		// TODO: connect to backend API
		alert("Saved! (connect me to backend 😎)");
	};

	const handleLogout = () => {
		localStorage.removeItem("JWT");
		navigate("/");
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100 flex flex-col items-center p-6">
			<motion.div
				className="cursor-pointer w-16 h-16 absolute top-4 left-4 text-white rounded-full text-lg font-bold flex items-center justify-center"
				whileHover={{ scale: 1.2 }}
				transition={{ type: "spring", stiffness: 500 }}
				onClick={() => navigate("/Home")}
			>
				<div className="ml-5 w-8 h-8 border-l-8 border-r-0 border-b-8 border-black transform rotate-45"></div>
			</motion.div>
			<h1 className="text-3xl font-bold text-center text-purple-500 mb-12">
				Hey, {username}!
			</h1>
			<div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 space-y-6">
				{/* Username */}
				<div className="flex flex-col">
					<label className="mb-1 font-medium text-gray-700">Username</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
					/>
				</div>

				{/* Email */}
				<div className="flex flex-col">
					<label className="mb-1 font-medium text-gray-700">Email</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
					/>
				</div>

				{/* Password */}
				<div className="flex flex-col">
					<label className="mb-1 font-medium text-gray-700">Password</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						placeholder="Enter new password"
						className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
					/>
				</div>

				{/* Save button */}
				<button
					onClick={handleSave}
					className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
				>
					Save Changes
				</button>
				<button
					onClick={handleLogout}
					className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
				>
					Logout
				</button>
			</div>
		</div>
	);
}
