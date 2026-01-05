import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NewMemberModal from "../components/NewMemberModal";
import NewItemModal from "../components/NewItemModal";

export default function Family() {
	const navigate = useNavigate();

	// Fake week data
	const weekDays = [
		{ label: "Mon", date: "2026-01-06", reservations: [{ id: 1, itemName: "Tent" }] },
		{ label: "Tue", date: "2026-01-07", reservations: [] },
		{ label: "Wed", date: "2026-01-08", reservations: [{ id: 2, itemName: "Kayak" }] },
		{ label: "Thu", date: "2026-01-09", reservations: [] },
		{ label: "Fri", date: "2026-01-10", reservations: [{ id: 3, itemName: "Grill" }] },
		{ label: "Sat", date: "2026-01-11", reservations: [] },
		{ label: "Sun", date: "2026-01-12", reservations: [] },
	];

	const membersFake = [
		{ id: 1, username: "Alice", role: "owner" },
		{ id: 2, username: "Bob", role: "admin" },
		{ id: 3, username: "Charlie", role: "member" },
	];

	const itemsFake = [
		{ id: 1, name: "Tent" },
		{ id: 2, name: "Kayak" },
		{ id: 3, name: "Grill" },
	];

	const [members, setMembers] = useState(membersFake);
	const [items, setItems] = useState(itemsFake);

	const [memberModalOpen, setMemberModalOpen] = useState(false);
	const [itemModalOpen, setItemModalOpen] = useState(false);

	const handleAddMember = (username: string) => {
		setMembers((prev) => [...prev, { id: Date.now(), username, role: "member" }]);
	};

	const handleAddItem = (name: string) => {
		setItems((prev) => [...prev, { id: Date.now(), name }]);
	};

	return <div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100">
		<div className="p-6 space-y-8">
			{/* Calendar */}
			<section>
				<h2 className="text-2xl font-bold mb-4">This Week's Reservations</h2>
				<div className="grid grid-cols-7 gap-3">
					{weekDays.map((day) => (
						<div
							key={day.date}
							className="bg-white rounded-xl p-3 shadow-sm min-h-[120px]"
						>
							<h3 className="text-sm font-semibold text-gray-600 mb-2">{day.label}</h3>

							{day.reservations.length === 0 && (
								<p className="text-xs text-gray-400">No reservations</p>
							)}

							{day.reservations.map((r) => (
								<motion.div
									key={r.id}
									className="mt-2 rounded-lg bg-purple-200 px-2 py-1 text-xs font-medium text-purple-800 cursor-pointer"
									whileHover={{ scale: 1.05 }}
									transition={{ type: "spring", stiffness: 500 }}
									onClick={() => navigate(`/reservation/${r.id}`)}
								>
									{r.itemName}
								</motion.div>
							))}
						</div>
					))}
				</div>
			</section>

			{/* Members */}
			<section>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-bold">Members</h2>
					<button
						onClick={() => setMemberModalOpen(true)}
						className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
					>
						Invite New Member
					</button>
				</div>
				<div className="bg-white rounded-2xl shadow-md p-4">
					{members.length === 0 ? (
						<p className="text-gray-500">No members yet.</p>
					) : (
						<ul className="space-y-2">
							{members.map((m) => (
								<li
									key={m.id}
									className="flex justify-between p-2 bg-purple-50 rounded-lg"
								>
									<span>{m.username}</span>
									<span className="text-gray-600 capitalize">{m.role}</span>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>

			{/* Items */}
			<section>
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-2xl font-bold">Items</h2>
					<button
						onClick={() => setItemModalOpen(true)}
						className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
					>
						Add Item
					</button>
				</div>
				<div className="bg-white rounded-2xl shadow-md p-4">
					{items.length === 0 ? (
						<p className="text-gray-500">No items yet.</p>
					) : (
						<ul className="space-y-2">
							{items.map((item) => (
								<li key={item.id} className="p-2 bg-purple-50 rounded-lg flex justify-between">
									<span>{item.name}</span>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>

			{/* Modals */}
			<NewMemberModal
				isOpen={memberModalOpen}
				onClose={() => setMemberModalOpen(false)}
				onSubmit={handleAddMember}
			/>
			<NewItemModal
				isOpen={itemModalOpen}
				onClose={() => setItemModalOpen(false)}
				onSubmit={handleAddItem}
			/>
		</div>
	</div>;
}
