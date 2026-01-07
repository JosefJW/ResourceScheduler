import { motion } from "framer-motion";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { GetFamilyReservationsResult } from "../services/reservation";

type CalendarProps = {
	reservations: GetFamilyReservationsResult[];
};

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
	return sunday;
}

function mapReservationsToWeek(reservations: GetFamilyReservationsResult[]): Day[] {
	const startOfWeek = getCurrentWeek();

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

export default function Calendar({ reservations }: CalendarProps) {
	const navigate = useNavigate();
	const weekDays = useMemo(() => mapReservationsToWeek(reservations), [reservations]);

	return (
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
	);
}
