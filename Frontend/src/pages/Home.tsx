import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import NewGroupModal from "../components/NewGroupModal";
import { useEffect, useMemo, useState } from "react";
import { createFamily, getFamilies, type GetFamiliesResult } from "./../services/family"
import toast from "react-hot-toast";
import { acceptInvite, declineInvite, getInvites, type GetInvitesResult } from "../services/invites";
import { getUserReservations, type GetUserReservationsResult } from "../services/reservation";

type Reservation = {
	id: number;
	itemName: string;
};

type Day = {
	label: string;
	date: string;
	reservations: Reservation[];
};

function mapReservationsToWeek(reservations: GetUserReservationsResult[]) {
	const { startOfWeek } = getCurrentWeek();

	const weekDays: Day[] = Array.from({ length: 7 }).map((_, i) => {
		const dayDate = new Date(startOfWeek);
		dayDate.setDate(startOfWeek.getDate() + i);
		const dayStr = dayDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

		// Filter reservations that overlap this day
		const dayReservations = reservations.filter(r => {
			const start = new Date(r.startTime);
			const end = new Date(r.endTime);

			// Overlaps this day if start <= end of day && end >= start of day
			const dayStart = new Date(dayDate);
			dayStart.setHours(0, 0, 0, 0);

			const dayEnd = new Date(dayDate);
			dayEnd.setHours(23, 59, 59, 999);

			return start <= dayEnd && end >= dayStart;
		}).map(r => ({ id: r.id, itemName: r.itemName }));

		return {
			label: dayDate.toLocaleDateString("en-US", { weekday: "short" }),
			date: dayStr,
			reservations: dayReservations,
		};
	});

	return weekDays;
}

function getCurrentWeek() {
	const now = new Date();

	// Sunday
	const startOfWeek = new Date(now);
	startOfWeek.setDate(now.getDate() - now.getDay());
	startOfWeek.setHours(0, 0, 0, 0);

	// Saturday
	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(startOfWeek.getDate() + 6);
	endOfWeek.setHours(23, 59, 59, 999);

	return { startOfWeek, endOfWeek };
}

export default function Home() {
	const [newGroupModalOpen, setNewGroupModalOpen] = useState(false);
	const [groups, setGroups] = useState<GetFamiliesResult[]>([]);
	const [invites, setInvites] = useState<GetInvitesResult[]>([]);
	const [reservations, setReservations] = useState<GetUserReservationsResult[]>([]);
	const navigate = useNavigate();

	async function handleCreateGroup(name: string) {
		try {
			await createFamily({ name: name });
			toast.success("Created " + name);
		}
		catch (err: any) {
			toast.error(err.detail);
		}

		await getGroups();
	};

	async function getGroups() {
		try {
			const families = await getFamilies();
			setGroups(families);
		}
		catch (err: any) {
			toast.error(err.detail);
		}
	}

	async function getMyInvites() {
		try {
			const invites = await getInvites();
			setInvites(invites);
		}
		catch (err: any) {
			toast.error(err.detail);
		}
	}

	async function getMyReservations() {
		try {
			const reservations = await getUserReservations();
			setReservations(reservations);
		}
		catch (err: any) {
			toast.error(err.detail);
		}
	}

	async function handleInviteAccept(inviteId: number, familyId: number) {
		try {
			await acceptInvite({ familyId, inviteId });
			await getMyInvites();
			await getGroups();
		}
		catch (err: any) {
			toast.error(err.detail);
		}
	}

	async function handleInviteDecline(inviteId: number, familyId: number) {
		try {
			await declineInvite({ familyId, inviteId });
			await getMyInvites();
		}
		catch (err: any) {
			toast.error(err.detail);
		}
	}

	useEffect(() => {
		getGroups();
		getMyInvites();
		getMyReservations();
	}, [])

	const weekDays = useMemo(() => mapReservationsToWeek(reservations), [reservations]);


	return (
		<div className="min-h-screen pb-10 bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100">
			<Navbar></Navbar>
			<div className="px-6 mt-6">
				{/* Calendar */}
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
				{/* Reservation Button */}
				<button
					onClick={() => navigate("/reserve")}
					className="mt-6 w-full rounded-3xl bg-gradient-to-r from-purple-400 to-pink-400 py-4 text-white font-bold shadow-lg hover:scale-[1.02] transition"
				>
					Make a Reservation
				</button>

				{/* Groups */}
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
						{groups.length > 0 ? groups.map(group => (
							<div
								key={group.id}
								onClick={() => navigate(`/family/${group.id}`)}
								className="cursor-pointer rounded-2xl bg-white p-4 shadow hover:bg-purple-50 transition"
							>
								<h3 className="font-semibold text-purple-600">
									{group.name}
								</h3>
							</div>
						))
						:	<div>You aren't in any groups!</div>}
					</div>
				</div>

				{/* Pending Invites */}
				{invites.length > 0 ?
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
									<div className="flex flex-col">
										<h3 className="font-semibold text-lg text-purple-600">
											{invite.familyName}
										</h3>
										<h4 className="font-semibold text-sm text-purple-600">
											From {invite.inviterName} at {new Date(invite.createdAt).toLocaleString()}
										</h4>
									</div>
									<div className="ml-auto flex flex-row">
										<div
											className="cursor-pointer rounded-xl text-white bg-red-600 p-4 shadow hover:bg-red-700 transition"
											onClick={() => {handleInviteDecline(invite.id, invite.familyId)}}
										>
											Decline
										</div>
										<div
											className="cursor-pointer rounded-xl text-white bg-green-600 p-4 shadow hover:bg-green-700 transition ml-5"
											onClick={() => {handleInviteAccept(invite.id, invite.familyId)}}
										>
											Accept
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				: <></>}
			</div>
		</div>
	);
}
