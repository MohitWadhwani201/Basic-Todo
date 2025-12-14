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
		<div className="w-full h-full flex flex-col bg-black border border-neutral-800 text-white rounded-2xl">
			{/* Header */}
			<div className="bg-black font-semibold text-center py-5 border-b border-neutral-800 tracking-wide text-xl">
				Habit Tracker — Week {selectedWeek + 1}
			</div>

			{/* Add Habit */}
			<div className="p-6 flex gap-5 border-b border-neutral-800">
				<input style={{fontSize:"20px"}}
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && add()}
					className="
						flex-1 bg-black text-white
						px-6 py-4
						text-lg
						rounded-xl
						border border-neutral-700
						focus:outline-none focus:border-green-500
						placeholder:text-neutral-500
					"
					placeholder="Add habit..."
				/>

				<button
					onClick={add}
					style={{height:"32px",width:"150px"}}
					className="
						px-7 py-4
						bg-black text-green-400
						rounded-xl
						flex items-center gap-3
						border border-green-500
						hover:bg-neutral-900
						transition
						text-lg
					"
				>
					<Plus size={20} /> Add
				</button>
			</div>

			{/* Table */}
			<div className="overflow-auto p-4">
				<table className="w-full border-separate border-spacing-1 text-base">
					<thead className="sticky top-0 bg-black z-10">
						<tr className="text-neutral-400" style={{height:"25px"}}>
							<th className="border border-neutral-800 p-5 text-left">Habit</th>

							{DAYS.map((d) => (
								<th key={d} className="border border-neutral-800 p-4 text-center">
									{d}
								</th>
							))}

							<th className="border border-neutral-800 p-5 text-center">Progress</th>
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
								>
									{/* Habit name */}
									<td className="border border-neutral-800 p-5 bg-black">
										<div className="flex items-center justify-between gap-5">
											<span className="text-lg">{h.name}</span>

											<button
												onClick={() => removeHabit(h._id)}
												className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-500 transition"
												title="Delete habit"
											>
												<X size={20} />
											</button>
										</div>
									</td>

									{/* Days */}
									{currentWeek.map((checked, idx) => (
										<td
											key={idx}
											className="border border-neutral-800 p-4 text-center bg-black"
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

									{/* Progress */}
									<td className="border border-neutral-800 p-5 bg-black">
										<div className="flex items-center gap-5">
											<div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
												<div
													className="h-full bg-green-500 rounded-full transition-all"
													style={{ width: `${progress}%` }}
												/>
											</div>
											<span className="text-green-400 text-base font-medium">
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
