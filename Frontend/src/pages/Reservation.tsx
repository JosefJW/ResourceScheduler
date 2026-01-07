import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { getReservation, type GetReservationResult } from "../services/reservation";
import HomeButton from "../components/HomeButton";

type Reservation = {
	id: number;
	itemName: string;
	date: string;
	time: string;
	familyName: string;
};

export default function Reservation() {
	const { reservationId } = useParams<{ reservationId: string }>();
	const [reservation, setReservation] = useState<GetReservationResult | null>(null);
	const navigate = useNavigate();

	async function fetchReservation() {
		try {
			const reservationIdNum = Number(reservationId);
			if (isNaN(reservationIdNum)) {
				navigate("/NotFound");
				return null;
			}
			const fetchedReservation = await getReservation({ reservationId: reservationIdNum });
			setReservation(fetchedReservation);
			console.log(fetchedReservation);
		}
		catch (err: any) {
			toast.error(err.detail);
		}
	}

	useEffect(() => {
		fetchReservation();
	}, [reservationId]);

	return <>{
		reservation ?
		<div>
			<Navbar />
			<HomeButton />
			<div className="min-h-screen bg-gradient-to-b from-pink-100 via-yellow-100 to-green-100">
				<br />
				<div className="p-6 max-w-md mx-auto bg-white rounded-2xl shadow-md">
					<h1 className="text-2xl font-bold mb-4">Reservation Details</h1>
					<p><strong>Item:</strong> {reservation.itemName}</p>
					<p><strong>User:</strong> {reservation.username}</p>
					<p><strong>From:</strong> {new Date(reservation.startTime).toLocaleString()}</p>
					<p><strong>To:</strong> {new Date(reservation.endTime).toLocaleString()}</p>
				</div>
			</div>
		</div>
		: <>Loading reservation...</>
	}</>
}
