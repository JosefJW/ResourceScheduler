import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import NewGroupModal from "../components/NewGroupModal";
import { useState } from "react";

type Reservation = {
	id: number;
	itemName: string;
};

type Day = {
	label: string;
	date: string;
	reservations: Reservation[];
};

type Family = {
	id: number;
	name: string;
};

type Invite = {
	id: number;
	familyName: string;
	from: string;
}

export default function Home() {
	const [newGroupModalOpen, setNewGroupModalOpen] = useState(false);
	const navigate = useNavigate();

	const handleCreateGroup = (name: string) => {
		// TODO: call backend API here
		// TODO: Update groups list with new group
	};

	// Fake week data
	const weekDays: Day[] = [
		{
			label: "Sun",
			date: "2026-01-05",
			reservations: [],
		},
		{
			label: "Mon",
			date: "2026-01-06",
			reservations: [
				{ id: 1, itemName: "Conference Room A" },
			],
		},
		{
			label: "Tue",
			date: "2026-01-07",
			reservations: [],
		},
		{
			label: "Wed",
			date: "2026-01-08",
			reservations: [
				{ id: 2, itemName: "Projector" },
				{ id: 3, itemName: "Meeting Room B" },
				{ id: 5, itemName: "Meeting Room and Fun House Number 52"},
				{ id: 6, itemName: "Giant 6 7 Statue"},
				{ id: 7, itemName: "Wowie"}
			],
		},
		{
			label: "Thu",
			date: "2026-01-09",
			reservations: [],
		},
		{
			label: "Fri",
			date: "2026-01-10",
			reservations: [
				{ id: 4, itemName: "Van" },
			],
		},
		{
			label: "Sat",
			date: "2026-01-11",
			reservations: [],
		},
	];

	// Fake families
	const families: Family[] = [
		{ id: 1, name: "CS House" },
		{ id: 2, name: "Startup Team" },
		{ id: 3, name: "Chess Club" },
	];

	// Fake invites
	const invites: Invite[] = [
		{ id: 1, familyName: "Work", from: "Bob" },
		{ id: 2, familyName: "Wolf", from: "Josef" }
	]

	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100">
			<Navbar></Navbar>
			<div className="px-6 mt-6">
				{/* Calendar */}
				<div className="grid grid-cols-7 gap-3">
					{weekDays.map(day => (
						<div
							key={day.date}
							className="bg-white rounded-xl p-3 shadow-sm min-h-[120px]"
						>
							<h3 className="text-sm font-semibold text-gray-600 mb-2">
								{day.label}
							</h3>

							{day.reservations.length === 0 && (
								<p className="text-xs text-gray-400">
									No reservations
								</p>
							)}

							{day.reservations.map(r => (
								<motion.div
									key={r.id}
									className="mt-2 rounded-lg bg-purple-200 px-2 py-1 text-xs font-medium text-purple-800 cursor-pointer"
									whileHover={{scale: 1.05}}
									transition={{ type: "spring", stiffness: 500 }}
									onClick={() => navigate(`/reservation/${r.id}`)}
								>
									{r.itemName}
								</motion.div>
							))}
						</div>
					))}
				</div>

				{/* Reservation Button */}
				<button
					onClick={() => navigate("/reserve")}
					className="mt-6 w-full rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 py-4 text-white font-bold shadow-lg hover:scale-[1.02] transition"
				>
					Make a Reservation
				</button>

				{/* Families */}
				<div className="mt-8">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-bold text-purple-500">
							Your Groups
						</h2>

						<button
							onClick={() => setNewGroupModalOpen(true)}
							className="rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-600 hover:bg-purple-200 transition"
						>
							+ New Group
						</button>
						<NewGroupModal
							isOpen={newGroupModalOpen}
							onClose={() => setNewGroupModalOpen(false)}
							onSubmit={handleCreateGroup}
						/>
					</div>
					<div className="space-y-3">
						{families.map(family => (
							<div
								key={family.id}
								onClick={() => navigate(`/family/${family.id}`)}
								className="cursor-pointer rounded-2xl bg-white p-4 shadow hover:bg-purple-50 transition"
							>
								<h3 className="font-semibold text-purple-600">
									{family.name}
								</h3>
							</div>
						))}
					</div>
				</div>

				{/* Pending Invites */}
				<div className="mt-8">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-lg font-bold text-purple-500">
							Pending Invites
						</h2>
					</div>
					<div className="space-y-3">
						{invites.map(invite => (
							<div
								key={invite.id}
								className="rounded-2xl bg-white p-4 shadow flex flex-row items-center"
							>
								<h3 className="font-semibold text-purple-600">
									{invite.familyName}
								</h3>
								<h4 className="font-semibold text-sm text-purple-600 ml-5">
									From {invite.from}
								</h4>
								<div className="ml-auto flex flex-row">
									{/* TODO onClick for decline */}
									<div
										className="cursor-pointer rounded-xl text-white bg-red-600 p-4 shadow hover:bg-red-700 transition"
									>
										Decline
									</div>
									{/* TODO onClick for accept */}
									<div
										className="cursor-pointer rounded-xl text-white bg-green-600 p-4 shadow hover:bg-green-700 transition ml-5"
									>
										Accept
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
