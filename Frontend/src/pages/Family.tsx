import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import NewMemberModal from "../components/NewMemberModal";
import NewItemModal from "../components/NewItemModal";
import toast from "react-hot-toast";
import { getFamilyMembers, type GetFamilyMembersResult } from "../services/family";
import { addItem, getFamilyItems, type GetFamilyItemsResult } from "../services/item";
import { getFamilyReservations, type GetFamilyReservationsResult } from "../services/reservation";
import { createInvite } from "../services/invites";

type Day = {
	label: string;
	date: string;
	reservations: { id: number; itemName: string }[];
};

function getCurrentWeek() {
	const now = new Date();
	const dayOfWeek = now.getDay(); // 0 = Sunday
	const sunday = new Date(now);
	sunday.setDate(now.getDate() - dayOfWeek);
	sunday.setHours(0, 0, 0, 0);

	const saturday = new Date(sunday);
	saturday.setDate(sunday.getDate() + 6);
	saturday.setHours(23, 59, 59, 999);

	return { startOfWeek: sunday, endOfWeek: saturday };
}

function mapReservationsToWeek(reservations: GetFamilyReservationsResult[]): Day[] {
	const { startOfWeek } = getCurrentWeek();

	return Array.from({ length: 7 }).map((_, i) => {
		const dayDate = new Date(startOfWeek);
		dayDate.setDate(startOfWeek.getDate() + i);
		const dayStr = dayDate.toISOString().split("T")[0];

		const dayReservations = reservations
			.filter(r => {
				const start = new Date(r.startTime);
				const end = new Date(r.endTime);
				const dayStart = new Date(dayDate);
				dayStart.setHours(0, 0, 0, 0);
				const dayEnd = new Date(dayDate);
				dayEnd.setHours(23, 59, 59, 999);

				return start <= dayEnd && end >= dayStart;
			})
			.map(r => ({ id: r.id, itemName: r.itemName }));

		return {
			label: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
			date: dayStr,
			reservations: dayReservations,
		};
	});
}

export default function Family() {
	const navigate = useNavigate();
	const { familyId } = useParams<{ familyId: string }>();
	const parsedFamilyId = Number(familyId);

	const [members, setMembers] = useState<GetFamilyMembersResult[]>([]);
	const [items, setItems] = useState<GetFamilyItemsResult[]>([]);
	const [reservations, setReservations] = useState<GetFamilyReservationsResult[]>([]);
	const [memberModalOpen, setMemberModalOpen] = useState(false);
	const [itemModalOpen, setItemModalOpen] = useState(false);

	if (!familyId || Number.isNaN(parsedFamilyId)) navigate("/NotFound");

	useEffect(() => {
		async function fetchData() {
			try {
				const mems = await getFamilyMembers({ familyId: parsedFamilyId });
				setMembers(mems);
				const its = await getFamilyItems({ familyId: parsedFamilyId });
				setItems(its);
				const resvs = await getFamilyReservations({ familyId: parsedFamilyId });
				setReservations(resvs);
			} catch (err: any) {
				toast.error(err.detail ?? "Unknown error");
			}
		}

		fetchData();
	}, [parsedFamilyId]);

	async function handleAddItem(name: string, type: string) {
		try {
			await addItem({ familyId: parsedFamilyId, name, type });
			toast.success("Created item");
			const its = await getFamilyItems({ familyId: parsedFamilyId });
			setItems(its);
		} catch (err: any) {
			toast.error(err.detail ?? "Unknown error");
		}
	}

	async function handleMakeInvite(username: string) {
		try {
			await createInvite({ username: username, familyId: parsedFamilyId });
			toast.success("Invite sent");
		}
		catch (err: any) {
			toast.error(err.detail ?? "Unknown error");
		}
	}

	const weekDays = useMemo(() => mapReservationsToWeek(reservations), [reservations]);

	return (
		<>
			<Navbar />
			<div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100 p-6 space-y-8">
				{/* Calendar */}
				<section>
					<h2 className="text-2xl font-bold mb-4">This Week's Reservations</h2>
					<div className="grid grid-cols-7 gap-3">
						{weekDays.map(day => (
							<div key={day.date} className="bg-white rounded-xl p-3 shadow-sm min-h-[120px]">
								<h3 className="text-sm font-semibold text-gray-600 mb-2">{day.label}</h3>
								{day.reservations.length === 0 && <p className="text-xs text-gray-400">No reservations</p>}
								{day.reservations.map(r => (
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
								{members.map(m => (
									<li key={m.id} className="flex justify-between p-2 bg-purple-50 rounded-lg">
										<span>{m.name}</span>
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
								{items.map(item => (
									<li key={item.id} className="p-2 bg-purple-50 rounded-lg flex justify-between">
										<span>{item.name}</span>
										<span className="text-gray-600 capitalize">{item.type}</span>
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
					onSubmit={handleMakeInvite}
				/>
				<NewItemModal
					isOpen={itemModalOpen}
					onClose={() => setItemModalOpen(false)}
					onSubmit={handleAddItem}
					existingTypes={items.map(i => i.type)}
				/>
			</div>
		</>
	);
}
