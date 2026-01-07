import { motion } from "framer-motion";

type MadeReservationModalProps = {
	itemName: string;
	start: string;
	end: string;
	onClose: () => void;
};

export default function MadeReservationModal({
	itemName,
	start,
	end,
	onClose,
}: MadeReservationModalProps) {
	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center space-y-4"
			>
				<h2 className="text-xl font-bold text-purple-600">
					Reservation Confirmed 🎉
				</h2>

				<p className="text-gray-700">
					Reserved <span className="font-semibold">{itemName}</span>
					<br />
					from <span className="font-semibold">{start}</span>
					<br />
					to <span className="font-semibold">{end}</span>
				</p>

				<button
					onClick={onClose}
					className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
				>
					Close
				</button>
			</motion.div>
		</div>
	);
}
