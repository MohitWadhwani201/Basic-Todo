import { useEffect, useState } from "react";
import API from "../api/api";
import { Plus, X } from "lucide-react";

export default function HabitTracker({ selectedWeek, todayIndex }) {
	const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	const [habits, setHabits] = useState([]);
	const [name, setName] = useState("");

	const load = async () => {
		const res = await API.get("/habits");

		const formatted = res.data.map((h) => ({
			_id: h._id,
			name: h.name,
			userId: h.userId,
			weeks: Array.isArray(h.weeks)
				? h.weeks.map((week) => [...week])
				: Array.from({ length: 4 }, () => Array(7).fill(false)),
		}));

		setHabits(formatted);
	};

	useEffect(() => {
		load();
	}, []);

	const add = async () => {
		if (!name.trim()) return;
		await API.post("/habits", { name });
		setName("");
		load();
	};

	const removeHabit = async (id) => {
		await API.delete(`/habits/${id}`);
		load();
	};

	const toggleDay = async (id, dayIndex) => {
		await API.patch(`/habits/${id}/toggle`, {
			weekIndex: selectedWeek,
			dayIndex,
		});
		load();
	};

	return (
		<div className="w-full h-full flex flex-col bg-black border border-neutral-800 text-white">
			{/* Header */}
			<div className="bg-black font-semibold text-center py-3 border-b border-neutral-800 tracking-wide">
				Habit Tracker — Week {selectedWeek + 1}
			</div>

			{/* Add Habit */}
			<div className="p-4 flex gap-3 border-b border-neutral-800">
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && add()}
					className="flex-1 bg-black text-white px-4 py-2 rounded-lg border border-neutral-700 focus:outline-none focus:border-green-500 placeholder:text-neutral-500"
					placeholder="Add habit..."
				/>

				<button
					onClick={add}
					className="px-5 py-2 bg-black text-green-400 rounded-lg flex items-center gap-2 border border-green-500 hover:bg-neutral-900 transition"
				>
					<Plus size={16} /> Add
				</button>
			</div>

			{/* Table */}
			<div className="overflow-auto">
				<table className="w-full border-collapse">
					<thead className="sticky top-0 bg-black">
						<tr className="text-neutral-400">
							<th className="border border-neutral-800 p-3 text-left">
								Habit
							</th>

							{DAYS.map((d) => (
								<th
									key={d}
									className="border border-neutral-800 p-2 text-center"
								>
									{d}
								</th>
							))}

							<th className="border border-neutral-800 p-3 text-center">
								Progress
							</th>
						</tr>
					</thead>

					<tbody>
						{habits.map((h) => {
							const currentWeek = h.weeks[selectedWeek];
							const completed = currentWeek.filter(Boolean).length;
							const progress = Math.round((completed / 7) * 100);

							return (
								<tr
									key={h._id}
									className="group text-neutral-200 hover:bg-neutral-900 transition"
									style={{ height: "30px" }}
								>
									{/* HABIT NAME + DELETE */}
									<td className="border border-neutral-800 p-3 bg-black">
										<div className="flex items-center justify-between gap-3">
											<span>{h.name}</span>

											<button
												onClick={() => removeHabit(h._id)}
												className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-500 transition"
												title="Delete habit"
											>
												<X size={16} />
											</button>
										</div>
									</td>

									{/* DAYS */}
									{currentWeek.map((checked, idx) => (
										<td
											key={idx}
											className="border border-neutral-800 p-2 text-center bg-black"
										>
											<div
												onClick={() => toggleDay(h._id, idx)}
												style={{
													width: "20px",
													height: "20px",
													margin: "0 auto",
													cursor: "pointer",
													backgroundColor: checked
														? "#22c55e"
														: "transparent",
													border: "2px solid #22c55e",
													borderRadius: "6px",
												}}
											/>
										</td>
									))}

									{/* PROGRESS */}
									<td className="border border-neutral-800 p-3 bg-black">
										<div className="flex items-center gap-3">
											<div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
												<div
													className="h-full bg-green-500 rounded-full transition-all"
													style={{ width: `${progress}%` }}
												/>
											</div>
											<span className="text-green-400 text-sm font-medium">
												{progress}%
											</span>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
