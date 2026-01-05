import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Reservation = {
	id: number;
	itemName: string;
	date: string;
	time: string;
	familyName: string;
};

export default function Reservation() {
	const { reservationId } = useParams<{ reservationId: string }>();
	const [reservation, setReservation] = useState<Reservation | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchReservation() {
			if (!reservationId) return;

			// TODO: Backend get reservation
			const data: Reservation = {
				id: 1,
				itemName: "6 7 Generator",
				date: "0800",
				time: "0980",
				familyName: "Wolf"
			}
			setReservation(data);
			setLoading(false);
		}

		fetchReservation();
	}, [reservationId]);

	if (loading) return <div>Loading reservation...</div>;
	if (!reservation) return <div>Reservation not found!</div>;

	return <div>
		<Navbar />
		<div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100">
			<br />
			<div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-md">
				<h1 className="text-2xl font-bold mb-4">Reservation Details</h1>
				<p><strong>Item:</strong> {reservation.itemName}</p>
				<p><strong>Family:</strong> {reservation.familyName}</p>
				<p><strong>Date:</strong> {reservation.date}</p>
				<p><strong>Time:</strong> {reservation.time}</p>
			</div>
		</div>;
	</div>
}
