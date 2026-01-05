import { useNavigate } from "react-router-dom";

export default function Navbar() {
	const navigate = useNavigate();

	return <header className="flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur shadow-sm">
		<h1 
			className="text-xl font-bold text-purple-500 cursor-pointer"
			onClick={() => navigate("/home")}
		>
			Grabbit
		</h1>
		<button
			onClick={() => navigate("/profile")}
			className="rounded-full bg-purple-100 px-4 py-2 font-semibold text-purple-600 hover:bg-purple-200 transition"
		>
			Account
		</button>
	</header>
}