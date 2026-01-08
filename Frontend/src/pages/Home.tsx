import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import NewGroupModal from "../components/NewGroupModal";
import { useEffect, useState } from "react";
import { createFamily, getFamilies, type GetFamiliesResult } from "./../services/family"
import toast from "react-hot-toast";
import { acceptInvite, declineInvite, getInvites, type GetInvitesResult } from "../services/invites";
import { getUserReservations, type GetUserReservationsResult } from "../services/reservation";
import Calendar from "../components/Calendar";

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

	return (
		<div className="min-h-screen pb-10 bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100">
			<Navbar></Navbar>
			<div className="px-6 mt-6">
				{/* Calendar */}
				<Calendar reservations={reservations} />
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
