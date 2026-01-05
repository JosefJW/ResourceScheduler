// src/pages/Landing.tsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ScrollIndicator from "./../components/ScrollIndicator";
import { useEffect } from "react";

export default function Landing() {
	useEffect(() => {
		document.title = "Grabbit - Landing";
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100">
			{/* Hero Section */}
			<section className="flex flex-col items-center justify-center text-center min-h-screen px-6">
				{/* Mascot */}
				<motion.img
					src="/src/assets/grabbit-rabbit-run.png"
					alt="Grabbit Rabbit running"
					className="w-48 h-36 mb-6"
					animate={{ y: [0, 20, 0] }}
					transition={{ repeat: Infinity, duration: 1.4 }}
				/>

				{/* Big Animated Title */}
				<motion.h1
					className="text-6xl sm:text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400"
					animate={{ scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] }}
					transition={{ repeat: Infinity, duration: 2 }}
				>
					Grabbit
				</motion.h1>

				<p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-md">
					Reserve anything, anytime! Stress-free scheduling for your team or organization.
				</p>

				<div className="flex gap-4">
					<Link
						to="/signup"
						className="px-6 py-3 bg-purple-400 hover:bg-purple-500 text-white font-bold rounded-3xl shadow-lg transition-all duration-300"
					>
						Sign Up
					</Link>
					<Link
						to="/login"
						className="px-6 py-3 bg-white border-2 border-purple-400 text-purple-500 font-bold rounded-3xl shadow-lg hover:bg-purple-50 transition-all duration-300"
					>
						Log In
					</Link>
				</div>
				<ScrollIndicator />
			</section>

			{/* Features Section */}
			<section className="py-20 px-6 bg-white">
				<h2 className="text-3xl font-bold text-center text-purple-500 mb-12">
					Features
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
					{[
						{
							title: "Quick Reservations",
							desc: "Book rooms, items, or resources in seconds with just a few clicks.",
							color: "bg-pink-200",
						},
						{
							title: "Team Sync",
							desc: "See what others have booked to avoid scheduling conflicts.",
							color: "bg-yellow-200",
						},
						{
							title: "Organized Dashboard",
							desc: "Keep track of upcoming reservations easily and efficiently.",
							color: "bg-green-200",
						},
						{
							title: "Notifications & Reminders",
							desc: "Never forget your bookings with timely alerts.",
							color: "bg-purple-200",
						},
					].map((feature, idx) => (
						<motion.div
							key={idx}
							className={`p-6 rounded-3xl shadow-lg ${feature.color} flex flex-col items-center text-center`}
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 500 }}
						>
							<h3 className="text-xl font-bold mb-2 text-purple-700">{feature.title}</h3>
							<p className="text-gray-700">{feature.desc}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-20 px-6 bg-gradient-to-b from-yellow-100 to-pink-100">
				<h2 className="text-3xl font-bold text-center text-purple-500 mb-12">
					How It Works
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
					{[
						{
							step: "1",
							title: "Browse",
							desc: "View all available items, rooms, or resources in your organization.",
						},
						{
							step: "2",
							title: "Reserve",
							desc: "Click to book instantly with a few taps.",
						},
						{
							step: "3",
							title: "Enjoy",
							desc: "Use your reserved resources without stress or conflicts.",
						},
					].map((item, idx) => (
						<motion.div
							key={idx}
							className="p-6 rounded-3xl bg-white shadow-lg flex flex-col items-center text-center"
							whileHover={{ scale: 1.05 }}
							transition={{ type: "spring", stiffness: 500 }}
						>
							<div className="w-16 h-16 flex items-center justify-center bg-purple-400 text-white rounded-full text-2xl font-bold mb-4">
								{item.step}
							</div>
							<h3 className="text-xl font-bold text-purple-500 mb-2">{item.title}</h3>
							<p className="text-gray-700">{item.desc}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* Final CTA */}
			<section className="py-20 px-6 text-center bg-green-100">
				<motion.h2
					className="text-3xl sm:text-4xl font-bold text-purple-500 mb-6 animate-bounce"
					animate={{ scale: [1, 1.05, 1] }}
					transition={{ repeat: Infinity, duration: 1.5 }}
				>
					Ready to Grabbit?
				</motion.h2>
				<Link
					to="/signup"
					className="px-8 py-4 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 text-white font-bold rounded-3xl shadow-lg text-lg sm:text-xl transition-all duration-300 hover:scale-105"
				>
					Get Started
				</Link>
			</section>
		</div>
	);
}
