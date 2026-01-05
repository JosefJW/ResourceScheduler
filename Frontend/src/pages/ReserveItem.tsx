import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Family = { id: number; name: string };
type ItemType = { id: number; name: string };
type Item = { id: number; name: string; familyId: number };

export default function ReserveItem() {
	const [families, setFamilies] = useState<Family[]>([]);
	const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
	const [selectedItemType, setSelectedItemType] = useState<number | null>(null);
	const [selectedFamilies, setSelectedFamilies] = useState<number[]>([]);
	const [selectedStartDate, setSelectedStartDate] = useState("");
	const [selectedStartTime, setSelectedStartTime] = useState("");
	const [selectedEndDate, setSelectedEndDate] = useState("");
	const [selectedEndTime, setSelectedEndTime] = useState("");
	const [availableItems, setAvailableItems] = useState<Item[]>([]);
	const [loading, setLoading] = useState(false);

	// Fetch families and item types on load
	useEffect(() => {
		async function fetchData() {
			// TODO: Backend get families and item types
			const familiesData: Family[] = [];
			const itemTypesData: ItemType[] = [];
			setFamilies(familiesData);
			setItemTypes(itemTypesData);
		}
		fetchData();
	}, []);

	// Handle "See Open Items"
	const handleSeeOpenItems = async () => {
		if (!selectedItemType || selectedFamilies.length === 0 || !selectedStartDate || !selectedStartTime || !selectedEndDate || !selectedEndTime) {
			alert("Please fill all selections first!");
			return;
		}
		setLoading(true);
		// TODO: Backend get available items
		const items: Item[] = [];
		setAvailableItems(items);
		setLoading(false);
	};

	// Handle reservation
	const handleReserve = async (itemId: number) => {
		// TODO: Backend reservation
		alert("Reservation made! 🎉");
		// Optionally refresh available items
	};

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
						onChange={(e) => setSelectedItemType(Number(e.target.value))}
					>
						<option value="" disabled>
							Select an item type
						</option>
						{itemTypes.map((type) => (
							<option key={type.id} value={type.id}>
								{type.name}
							</option>
						))}
					</select>
				</div>

				{/* Families */}
				<div className="flex flex-col">
					<label className="mb-1 font-medium text-gray-700">Families</label>
					<div className="flex flex-col space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
						{families
							.filter((f) => {
								// optionally filter families that have items of selected type
								return true; // implement logic after backend
							})
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

				<button
					onClick={handleSeeOpenItems}
					className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
				>
					{loading ? "Loading..." : "See Open Items"}
				</button>

				{/* Available Items */}
				{availableItems.length > 0 && (
					<div className="mt-4 space-y-2">
						<h2 className="text-lg font-semibold text-gray-700">Available Items:</h2>
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
					</div>
				)}
			</div>
		</div>
	</div>;
}
