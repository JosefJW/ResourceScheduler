// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import toast from "react-hot-toast";

export default function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
			document.title = "Grabbit - Login";
		}, []);

	async function handleLoginSubmit() {
		try {
			const loginRes = await login({ username, password });
			localStorage.setItem("JWT", loginRes.token);
			navigate("/home");
		}
		catch (err: any) {
			toast.error(err.detail);
		}
	};

	return <div>
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-yellow-200 to-pink-200 p-4">
			{/* Home Button */}
			<motion.div
				className="cursor-pointer w-16 h-16 absolute top-4 left-4 text-white rounded-full text-lg font-bold flex items-center justify-center"
				whileHover={{ scale: 1.2 }}
				transition={{ type: "spring", stiffness: 500 }}
				onClick={() => navigate("/")}
			>
				<div className="ml-5 w-8 h-8 border-l-8 border-r-0 border-b-8 border-black transform rotate-45"></div>
			</motion.div>
			{/* Card */}
			<motion.div
				initial={{ opacity: 0, y: 50 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
				className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 sm:p-10 max-w-md w-full flex flex-col items-center"
			>
				{/* Grabbit Mascot */}
				<motion.img
					src="/src/assets/grabbit-rabbit-peak.png"
					alt="Grabbit Rabbit peaking"
					className="w-64 h-44 -mt-20 mb-4"
					whileHover={{ rotate: -5, scale: 1.2 }}
					transition={{ type: "spring", stiffness: 200, damping: 10 }}
				/>
				<h1 className="text-3xl font-bold text-purple-500 mb-6 text-center animate-bounce">
					Welcome Back!
				</h1>

				<form className="w-full space-y-4" onSubmit={(e) => { e.preventDefault(); handleLoginSubmit(); }}>
					{[
						{ type: "username", value: username, setter: setUsername, placeholder: "Username" },
						{ type: "password", value: password, setter: setPassword, placeholder: "Password" },
					].map((input, idx) => (
						<motion.input
							key={idx}
							type={input.type}
							placeholder={input.placeholder}
							value={input.value}
							onChange={(e) => input.setter(e.target.value)}
							className="w-full px-5 py-3 rounded-3xl border-2 border-purple-200 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-200 shadow-md text-sm sm:text-base transition-all duration-300"
							whileFocus={{ scale: 1.03, boxShadow: "0 0 15px rgba(128,0,128,0.3)" }}
							required
						/>
					))}

					<motion.button
						type="submit"
						className="w-full py-3 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 text-white font-bold rounded-3xl shadow-lg text-sm sm:text-base transition-all duration-300"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Log In
					</motion.button>
				</form>

				<p className="text-center text-gray-500 mt-4 text-sm sm:text-base">
					Don't have an account?{" "}
					<a href="/signup" className="text-purple-500 font-semibold hover:underline">
						Sign up
					</a>
				</p>
			</motion.div>
		</div>
	</div>;
}
