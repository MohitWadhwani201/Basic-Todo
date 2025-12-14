import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MIN_ROWS = 4;

export default function TaskManager({ week, onStatsRefresh, todayIndex }) {
	const [tasks, setTasks] = useState([]);
	const [editing, setEditing] = useState({});
	const [cellValues, setCellValues] = useState({});
	const inputRefs = useRef({});
	const navigate = useNavigate();

	// Load tasks
	const load = async () => {
		const res = await API.get(`/tasks?week=${week}`);
		const fetched = res.data || [];

		const grouped = Array(7)
			.fill(0)
			.map(() => []);

		fetched.forEach((t) => grouped[t.dayIndex].push(t));

		grouped.forEach((day, dayIndex) => {
			while (day.length < MIN_ROWS) {
				day.push({
					_id: `empty-${dayIndex}-${day.length}`,
					title: "",
					empty: true,
					dayIndex,
				});
			}
		});

		const flat = grouped.flat();
		setTasks(flat);

		const values = {};
		flat.forEach((t) => (values[t._id] = t.title));
		setCellValues(values);
	};

	useEffect(() => {
		load();
	}, [week]);

	const handleSave = async (task, value) => {
		const trimmed = value.trim();

		if (task.empty && trimmed === "") return;

		if (!task.empty && trimmed === "") {
			await API.delete(`/tasks/${task._id}`);
			return load();
		}

		if (task.empty && trimmed !== "") {
			await API.post("/tasks", {
				title: trimmed,
				dayIndex: task.dayIndex,
				weekIndex: week,
			});
			return load();
		}

		await API.put(`/tasks/${task._id}`, { title: trimmed });
		load();
	};

	const toggleTask = async (task) => {
		if (task.empty) return;
		await API.patch(`/tasks/${task._id}/toggle`, {
			completed: !task.completed,
		});
		onStatsRefresh?.();
		load();
	};

	const onKeyDown = async (e, task) => {
		if (e.key === "Enter") {
			e.preventDefault();
			await handleSave(task, cellValues[task._id]);
			setEditing((ed) => ({ ...ed, [task._id]: false }));
		}

		if (e.key === "Backspace" && cellValues[task._id] === "" && !task.empty) {
			await API.delete(`/tasks/${task._id}`);
			load();
		}
	};

	const startEditing = (task) => {
		setEditing((e) => ({ ...e, [task._id]: true }));
		setTimeout(() => inputRefs.current[task._id]?.focus(), 10);
	};

	// Group tasks by day
	const tasksByDay = Array(7)
		.fill(0)
		.map(() => []);
	tasks.forEach((t) => tasksByDay[t.dayIndex].push(t));

	const isBottomRowEmpty = () => {
		const rowCount = tasksByDay[0].length;
		const bottomIndex = rowCount - 1;

		return WEEK_DAYS.every((_, d) => {
			const task = tasksByDay[d][bottomIndex];
			return !task || task.title.trim() === "";
		});
	};

	const removeBottomRow = async () => {
		const rowCount = tasksByDay[0].length;
		if (rowCount <= MIN_ROWS || !isBottomRowEmpty()) return;

		const bottomIndex = rowCount - 1;
		for (let d = 0; d < 7; d++) {
			const t = tasksByDay[d][bottomIndex];
			if (t && !t.empty && !t._id.startsWith("empty")) {
				await API.delete(`/tasks/${t._id}`);
			}
		}
		load();
	};

	const addRowToAllDays = () => {
		const newPlaceholders = [];

		for (let d = 0; d < 7; d++) {
			newPlaceholders.push({
				_id: `empty-${d}-${Date.now()}`,
				title: "",
				empty: true,
				dayIndex: d,
			});
		}

		setTasks([...tasks, ...newPlaceholders]);

		const values = { ...cellValues };
		newPlaceholders.forEach((t) => (values[t._id] = ""));
		setCellValues(values);

		setEditing((ed) => ({ ...ed, [newPlaceholders[0]._id]: true }));
		setTimeout(() => inputRefs.current[newPlaceholders[0]._id]?.focus(), 30);
	};

	return (
		<div className="w-full h-full flex flex-col bg-black " >
			{/* GRID */}
			<div className="flex gap-3 h-full p-4">
				{WEEK_DAYS.map((day, dayIndex) => (
					<div
						key={day}
						className={`flex flex-col rounded-xl overflow-hidden border ${
							dayIndex === todayIndex
								? "border-emerald-500 bg-gray-900"
								: "border-gray-800 bg-gray-900"
						}`}
						style={{ width: "14.28%" }}
					>
						<div className="px-4 py-4 text-base font-semibold text-center bg-gray-800 border-b border-gray-700 text-white">
							{day}
						</div>

						<div className="flex-1 overflow-auto p-4 space-y-4 bg-black ">
							{tasksByDay[dayIndex].map((task) => (
								<div
									key={task._id}
									style={{fontSize:"20px"}}
									className={`flex items-center gap-4 px-5 py-4 min-h-[56px] rounded-xl transition-colors hover:bg-gray-900 ${
										task.empty
											? "border border-dashed border-gray-800"
											: "bg-gray-900"
									}`}
								>
									{/* Text */}
									{editing[task._id] ? (
										<input
											ref={(el) => (inputRefs.current[task._id] = el)}
											className="flex-1 text-base outline-none bg-transparent text-white placeholder-gray-500 "
											style={{ height: "26px" }}
											value={cellValues[task._id] ?? ""}
											onChange={(e) =>
												setCellValues((v) => ({
													...v,
													[task._id]: e.target.value,
												}))
											}
											onBlur={() => {
												handleSave(task, cellValues[task._id]);
												setEditing((ed) => ({
													...ed,
													[task._id]: false,
												}));
											}}
											onKeyDown={(e) => onKeyDown(e, task)}
											// placeholder="Type here…"
										/>
									) : (
										<div
											onClick={() => startEditing(task)}
											className={`flex-1 text-base cursor-text ${
												task.completed
													? "line-through text-gray-400"
													: "text-white"
											} ${task.empty ? "italic text-gray-500" : ""}`}
										>
											{task.title || "Type here…"}
										</div>
									)}

									{/* CHECKBOX */}
									<div
										onClick={() => toggleTask(task)}
										style={{
											width: "26px",
											height: "26px",
											cursor: task.empty ? "not-allowed" : "pointer",
											backgroundColor: task.completed
												? "#10b981"
												: "transparent",
											border: `2px solid ${
												task.completed ? "#10b981" : "#4b5563"
											}`,
											borderRadius: "6px",
											opacity: task.empty ? 0.5 : 1,
										}}
									>
										{task.completed && (
											<svg
												className="w-5 h-5 mx-auto mt-1"
												fill="none"
												viewBox="0 0 24 24"
												stroke="white"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2.5}
													d="M5 13l4 4L19 7"
												/>
											</svg>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{/* BUTTONS */}
			<div className="w-full mt-3 pt-8 pb-5 bg-gray-900 border-t border-gray-800 flex justify-center gap-8">
				<button
					onClick={addRowToAllDays}
					className="px-8 py-4 rounded-xl bg-gray-800 border border-gray-700 text-base font-semibold text-white hover:bg-gray-700 hover:border-emerald-500 transition"
				>
					+ Add Row To All Days
				</button>

				<button
					onClick={removeBottomRow}
					className={`px-8 py-4 rounded-xl text-base font-semibold border transition ${
						isBottomRowEmpty() && tasksByDay[0].length > MIN_ROWS
							? "bg-gray-800 text-red-400 border-gray-700 hover:border-red-500 hover:bg-gray-700"
							: "bg-gray-900 text-gray-600 border-gray-800 cursor-not-allowed"
					}`}
				>
					- Remove Bottom Row
				</button>
			</div>
		</div>
	);
}