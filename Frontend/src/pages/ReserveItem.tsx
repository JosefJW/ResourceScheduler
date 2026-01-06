import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { getFamilyItems, getFamilyItemsOfType, type GetFamilyItemsOfTypeResult, type GetFamilyItemsResult, getUserTypes, type GetUserTypesResult } from "../services/item";
import { getFamilies, type GetFamiliesResult } from "../services/family";
import { checkItemAvailability, makeReservation, type CheckItemAvailabilityResult } from "../services/reservation";

type Family = { id: number; name: string };
type ItemType = { id: number; name: string };
type Item = { id: number; name: string; familyId: number };

export default function ReserveItem() {
	const [allFamilies, setAllFamilies] = useState<GetFamiliesResult[]>([]);
	const [families, setFamilies] = useState<GetFamiliesResult[]>([]);
	const [itemTypes, setItemTypes] = useState<GetUserTypesResult[]>([]);
	const [selectedItemType, setSelectedItemType] = useState<string | null>(null);
	const [selectedFamilies, setSelectedFamilies] = useState<number[]>([]);
	const [selectedStartDate, setSelectedStartDate] = useState("");
	const [selectedStartTime, setSelectedStartTime] = useState("");
	const [selectedEndDate, setSelectedEndDate] = useState("");
	const [selectedEndTime, setSelectedEndTime] = useState("");
	const [availableItems, setAvailableItems] = useState<GetFamilyItemsOfTypeResult[]>([]);
	const [loading, setLoading] = useState(false);

	async function getItemTypes() {
		try {
			const types: GetUserTypesResult[] = await getUserTypes();
			setItemTypes(types);
		}
		catch(err: any) {
			toast.error(err.detail);
		}
	}

	async function getFamiliesWithType(type: string) {
		const matchingFamilies: typeof allFamilies = [];

		for (const family of allFamilies) {
			const familyItems: GetFamilyItemsResult[] = await getFamilyItems({ familyId: family.id });
			if (familyItems.some(item => item.type === type)) {
				matchingFamilies.push(family);
			}
		}

		setFamilies(matchingFamilies);
	}

	async function getMyFamilies() {
		try {
			const allMyFamilies: GetFamiliesResult[] = await getFamilies();
			setAllFamilies(allMyFamilies);
			setFamilies(allMyFamilies);
		}
		catch(err: any) {
			toast.error(err.detail);
		}
	}

	// Fetch families and item types on load
	useEffect(() => {
		getMyFamilies();
		getItemTypes();
	}, []);

	// Update open items on form input change
	useEffect(() => {
		// Do nothing until all required fields are filled
		if (
			!selectedItemType ||
			selectedFamilies.length === 0 ||
			!selectedStartDate ||
			!selectedStartTime ||
			!selectedEndDate ||
			!selectedEndTime
		) {
			setAvailableItems([]);
			return;
		}

		const timeout = setTimeout(() => {
			handleSeeOpenItems();
		}, 400);

		return () => clearTimeout(timeout);
	}, [
		selectedItemType,
		selectedFamilies,
		selectedStartDate,
		selectedStartTime,
		selectedEndDate,
		selectedEndTime,
	]);


	// Handle "See Open Items"
	const handleSeeOpenItems = async () => {
		// Ensure all fields are valid
		if (!selectedItemType || selectedFamilies.length === 0 || !selectedStartDate || !selectedStartTime || !selectedEndDate || !selectedEndTime) {
			toast.error("Please fill all selections first");
			return;
		}
		const startUTC = new Date(`${selectedStartDate}T${selectedStartTime}:00Z`).toISOString();
		const endUTC = new Date(`${selectedEndDate}T${selectedEndTime}:00Z`).toISOString();
		if (startUTC >= endUTC) {
			toast.error("Start date must be before end date");
			return;
		}


		setLoading(true);
		
		// Get all items that fit the constraints
		const possibleItems: GetFamilyItemsOfTypeResult[] = [];
		for (const family of selectedFamilies) {
			const familyItems: GetFamilyItemsOfTypeResult[] = await getFamilyItemsOfType({ familyId: family, type: selectedItemType });
			
			// Check items for availability
			for (const item of familyItems) {
				const itemAvailability: CheckItemAvailabilityResult = await checkItemAvailability({ itemId: item.id, startTime: startUTC, endTime: endUTC });
				if (itemAvailability.available) {
					possibleItems.push(item);
				}
			}
		}

		setAvailableItems(possibleItems);
		setLoading(false);
	};

	// Handle reservation
	const handleReserve = async (itemId: number) => {
		try {
			const startUTC = new Date(`${selectedStartDate}T${selectedStartTime}:00Z`).toISOString();
			const endUTC = new Date(`${selectedEndDate}T${selectedEndTime}:00Z`).toISOString();
			if (startUTC >= endUTC) {
				toast.error("Start date must be before end date");
				return;
			}

			makeReservation({ itemId: itemId, startTime: startUTC, endTime: endUTC });
			toast.success("Reservation made");

			setAvailableItems((prev) => prev.filter((item) => item.id !== itemId));
		}
		catch (err: any) {
			toast.error(err.detail);
		}
	};


	const allInputsFilled =
		selectedItemType &&
		selectedFamilies.length > 0 &&
		selectedStartDate &&
		selectedStartTime &&
		selectedEndDate &&
		selectedEndTime;

	return <div>
		<Navbar></Navbar>
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100 p-6 flex flex-col items-center">
			<h1 className="text-3xl font-bold text-purple-500 mb-8">Reserve an Item</h1>

			<div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-6 space-y-6">
				{/* Item Type */}
				<div className="flex flex-col">
					<label className="mb-1 font-medium text-gray-700">Item Type</label>
					<select
						className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
						value={selectedItemType ?? ""}
						onChange={(e) => { 
							setSelectedItemType(e.target.value);
							getFamiliesWithType(e.target.value); 
							setSelectedFamilies([])}}
					>
						<option value="" disabled>
							Select an item type
						</option>
						{itemTypes.map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>
				</div>

				{/* Families */}
				<div className="flex flex-col">
					<label className="mb-1 font-medium text-gray-700">Groups</label>
					<div className="flex flex-col space-y-2 overflow-y-auto border rounded-lg p-2">
						{families
							.map((f) => (
								<label key={f.id} className="flex items-center space-x-2">
									<input
										type="checkbox"
										value={f.id}
										checked={selectedFamilies.includes(f.id)}
										onChange={(e) => {
											const id = f.id;
											setSelectedFamilies((prev) =>
												prev.includes(id)
													? prev.filter((x) => x !== id)
													: [...prev, id]
											);
										}}
										className="rounded border-gray-300 focus:ring-2 focus:ring-purple-400"
									/>
									<span>{f.name}</span>
								</label>
							))}
					</div>
				</div>

				{/* Start Date and Time */}
				<div className="flex flex-col">
					Start Date
					<div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
						<input
							type="date"
							className="rounded-lg border border-gray-300 px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
							value={selectedStartDate}
							onChange={(e) => setSelectedStartDate(e.target.value)}
						/>
						<input
							type="time"
							className="rounded-lg border border-gray-300 px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
							value={selectedStartTime}
							onChange={(e) => setSelectedStartTime(e.target.value)}
						/>
					</div>
				</div>

				{/* End Date and Time */}
				<div className="flex flex-col">
					End Date
					<div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
						<input
							type="date"
							className="rounded-lg border border-gray-300 px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
							value={selectedEndDate}
							onChange={(e) => setSelectedEndDate(e.target.value)}
						/>
						<input
							type="time"
							className="rounded-lg border border-gray-300 px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
							value={selectedEndTime}
							onChange={(e) => setSelectedEndTime(e.target.value)}
						/>
					</div>
				</div>

				{/* Available Items */}
				<div className="mt-4 space-y-2">
					{!allInputsFilled ? (
						<div className="text-center text-gray-400">
							Enter all inputs to see availability
						</div>
					) : loading ? (
						<div className="text-center text-gray-500">
							Checking availability…
						</div>
					) : availableItems.length > 0 ? (
						<>
							<h2 className="text-lg font-semibold text-gray-700">
								Available Items:
							</h2>
							<div className="flex flex-col space-y-2 max-h-64 overflow-y-auto">
								{availableItems.map((item) => (
									<div
										key={item.id}
										className="flex justify-between items-center bg-purple-50 rounded-lg p-3 shadow-sm"
									>
										<span>{item.name}</span>
										<button
											onClick={() => handleReserve(item.id)}
											className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg transition-transform hover:scale-[1.05] active:scale-[0.95]"
										>
											Make Reservation
										</button>
									</div>
								))}
							</div>
						</>
					) : (
						<div className="text-center text-gray-400">
							No items available
						</div>
					)}
				</div>
			</div>
		</div>
	</div>;
}
