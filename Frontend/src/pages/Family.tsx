import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import NewMemberModal from "../components/NewMemberModal";
import NewItemModal from "../components/NewItemModal";
import toast from "react-hot-toast";
import { getFamily, type GetFamilyResult, getFamilyMembers, type GetFamilyMembersResult } from "../services/family";
import { addItem, getFamilyItems, type GetFamilyItemsResult } from "../services/item";
import { getFamilyReservations, type GetFamilyReservationsResult } from "../services/reservation";
import { createInvite } from "../services/invites";
import Calendar from "../components/Calendar";
import HomeButton from "../components/HomeButton";

export default function Family() {
	const navigate = useNavigate();
	const { familyId } = useParams<{ familyId: string }>();
	const parsedFamilyId = Number(familyId);

	const [familyName, setFamilyName] = useState<GetFamilyResult>();
	const [members, setMembers] = useState<GetFamilyMembersResult[]>([]);
	const [items, setItems] = useState<GetFamilyItemsResult[]>([]);
	const [reservations, setReservations] = useState<GetFamilyReservationsResult[]>([]);
	const [memberModalOpen, setMemberModalOpen] = useState(false);
	const [itemModalOpen, setItemModalOpen] = useState(false);

	if (!familyId || Number.isNaN(parsedFamilyId)) navigate("/NotFound");

	useEffect(() => {
		async function fetchData() {
			try {
				const famName = await getFamily({ familyId: parsedFamilyId });
				setFamilyName(famName);
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
	console.log(familyName);
	return (
		<>
			<Navbar />
			<HomeButton />
			<div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100 p-6 space-y-8">
				{
					familyName ?
					<div className="flex flex-col items-center">
						<h2 className="text-2xl font-bold">{ familyName.familyName }</h2>
					</div>
					: <br />
				}
				{/* Calendar */}
				<Calendar reservations={reservations} />

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
