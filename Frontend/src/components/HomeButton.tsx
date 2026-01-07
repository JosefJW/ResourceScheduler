import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom";

export default function HomeButton() {
	const navigate = useNavigate();

	return <motion.div
		className="cursor-pointer w-16 h-16 absolute top-20 left-4 text-white rounded-full text-lg font-bold flex items-center justify-center"
		whileHover={{ scale: 1.2 }}
		transition={{ type: "spring", stiffness: 500 }}
		onClick={() => navigate("/home")}
	>
		<div className="ml-5 w-6 h-6 border-l-4 border-r-0 border-b-4 border-black transform rotate-45"></div>
	</motion.div>;
}