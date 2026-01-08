import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, updateEmail, updatePassword, updateUsername, type GetUserResult } from "../services/auth";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import HomeButton from "../components/HomeButton";

export default function Profile() {
	const [savedUsername, setSavedUsername] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const navigate = useNavigate();

	const fetchUserInformation = async() => {
		const user: GetUserResult = await getUser();
		setUsername(user.username);
		setSavedUsername(user.username);
		setEmail(user.email);
	}

	const handleSaveUsername = async () => {
		try {
			updateUsername({ username });
			setSavedUsername(username);
			toast.success("Changed username to " + username);
		} catch (err: any) {
			toast.error(err.detail);
		}
	};

	const handleSaveEmail = async () => {
		try {
			updateEmail({ email });
			toast.success("Changed email to " + email);
		} catch (err: any) {
			toast.error(err.detail);
		}
	};

	const handleSavePassword = async () => {
		if (!oldPassword || !newPassword) return toast.error("Enter both old and new passwords!");
		try {
			updatePassword({ oldPassword, newPassword });
			toast.success("Updated password");
			setOldPassword("");
			setNewPassword("");
		} catch (err: any) {
			toast.error(err.detail);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("JWT");
		navigate("/");
	};

	useEffect(() => {
	fetchUserInformation()
	}, []);

	return <>
		<Navbar />
		<HomeButton />
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100 flex flex-col items-center p-6">
			<h1 className="text-3xl font-bold text-center text-purple-500 mb-12">
				Hey, {savedUsername}!
			</h1>

			<div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 space-y-6">
				{/* Username */}
				<div className="flex items-center space-x-3">
					<div className="flex-1 flex flex-col">
						<label className="mb-1 font-medium text-gray-700">Change Username</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
						/>
					</div>
					<button
						onClick={handleSaveUsername}
						className="bg-purple-500 hover:bg-purple-600 text-white font-semibold mt-7 py-2 px-4 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
					>
						Save
					</button>
				</div>

				{/* Email */}
				<div className="flex items-center space-x-3">
					<div className="flex-1 flex flex-col">
						<label className="mb-1 font-medium text-gray-700">Change Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
						/>
					</div>
					<button
						onClick={handleSaveEmail}
						className="bg-purple-500 hover:bg-purple-600 text-white font-semibold mt-7 py-2 px-4 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
					>
						Save
					</button>
				</div>

				{/* Password */}
				<div className="flex flex-col space-y-3">
					<label className="font-medium text-gray-700">Change Password</label>
					<input
						type="password"
						value={oldPassword}
						onChange={(e) => setOldPassword(e.target.value)}
						placeholder="Old password"
						className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
					/>
					<input
						type="password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder="New password"
						className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
					/>
					<button
						onClick={handleSavePassword}
						className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
					>
						Save Password
					</button>
				</div>

				<button
					onClick={handleLogout}
					className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
				>
					Logout
				</button>
			</div>
		</div>
	</>;
}
