import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stats from "../components/Stats";
import HabitTracker from "../components/HabitTracker";
import TaskManager from "../components/TaskManager";
import API from "../api/api";

export default function Dashboard() {
	const [selectedWeek, setSelectedWeek] = useState(0);
	const [todayIndex, setTodayIndex] = useState(null);
	const [loaded, setLoaded] = useState(false);
	const [statsRefreshKey, setStatsRefreshKey] = useState(0);
	const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

	const navigate = useNavigate();

	const refreshStats = () => {
		setStatsRefreshKey((k) => k + 1);
	};
	const loadCurrent = async () => {
		try {
			const res = await API.get("/current-week");

			const weekIndex = Number.isInteger(res.data?.weekIndex) ? res.data.weekIndex : 0;

			const dayIndex = Number.isInteger(res.data?.dayIndex) ? res.data.dayIndex : 0;

			setCurrentWeekIndex(weekIndex);
			setTodayIndex(dayIndex);
			setSelectedWeek(weekIndex);
		} catch (err) {
			console.error("Failed to load current week/day", err);
			setCurrentWeekIndex(0);
			setSelectedWeek(0);
			setTodayIndex(0);
		} finally {
			setLoaded(true);
		}
	};

	const resetEverything = async () => {
		const confirmed = window.confirm(
			"⚠️ WARNING!\n\n" +
				"This will:\n" +
				"• Delete ALL tasks from all 4 weeks\n" +
				"• Reset ALL habit checkboxes\n\n" +
				"📸 Please take screenshots if you want to keep a record.\n\n" +
				"Click OK to continue or Cancel to abort."
		);

		if (!confirmed) return;

		try {
			await API.post("/tasks/reset-all");
			await loadCurrent(); // ✅ SAFE NOW
			setStatsRefreshKey((k) => k + 1);
		} catch (err) {
			alert("Failed to reset data. Check console.");
			console.error(err);
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		navigate("/");
	};

	useEffect(() => {
		loadCurrent();
	}, []);

	if (!loaded || todayIndex === null) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[var(--bg-dark)]">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
					<span className="text-[var(--text-muted)] text-lg">Loading dashboard...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="relative min-h-screen w-full bg-[var(--bg-dark)] px-8 py-10 pb-28 space-y-10">
			{/* HEADER */}
			<div>
				<h1 className="text-3xl font-bold text-[var(--text-primary)]">Dashboard Overview</h1>
				<p className="text-[var(--text-muted)] mt-1">Week {selectedWeek + 1} progress and tasks</p>
			</div>

			{/* STATS + HABITS (VISIBLE SEPARATION FIX) */}
			<div className="bg-[var(--bg-dark)] p-3 rounded-3xl">
				<div className="flex w-full gap-10">
					<div
						style={{
							marginRight: "10px",
							marginBottom: "20px",
							marginLeft: "8px",
							marginTop: "8px",
							padding: "4px",
							borderRadius: "10px",
						}}
						className="flex-1 bg-[var(--bg-card)] rounded-2xl shadow border border-[var(--border)]"
					>
						<div className="p-6">
							<Stats selectedWeek={selectedWeek} refreshKey={statsRefreshKey} />
						</div>
					</div>

					<div
						style={{
							marginRight: "8px",
							marginBottom: "20px",
							marginTop: "8px",
							padding: "4px",
							borderRadius: "10px",
						}}
						className="flex-1 bg-[var(--bg-card)] rounded-2xl shadow border border-[var(--border)]"
					>
						<div className="p-6">
							<HabitTracker
								selectedWeek={selectedWeek}
								todayIndex={todayIndex}
								currentWeekIndex={currentWeekIndex}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* TASK MANAGER */}
			<div
				style={{ marginBottom: "10px" }}
				className="bg-[var(--bg-card)] rounded-2xl shadow border border-[var(--border)] p-8 space-y-4"
			>
				<div>
					<h2 className="text-2xl font-bold text-[var(--text-primary)]">Task Manager</h2>
					<p style={{ paddingBottom: "10px" }} className="text-[var(--text-muted)]">
						Tasks for Week {selectedWeek + 1}
					</p>
				</div>

				<TaskManager
					week={selectedWeek}
					todayIndex={todayIndex}
					onStatsRefresh={refreshStats}
					currentWeekIndex={currentWeekIndex}
				/>
			</div>

			{/* WEEK SWITCHER */}
			<div className="bg-[var(--bg-card)] rounded-2xl shadow border border-[var(--border)] px-8 py-6">
				<h3
					className="text-lg font-semibold text-center mb-6 text-[var(--text-primary)]"
					style={{ paddingBottom: "5px" }}
				>
					Select Week
				</h3>

				<div className="flex justify-center flex-wrap gap-4">
					{["Week 1", "Week 2", "Week 3", "Week 4"].map((label, i) => (
						<button
							style={{
								paddingRight: "5px",
								paddingLeft: "5px",
								marginLeft: "5px",
								marginRight: "5px",
							}}
							key={i}
							onClick={() => setSelectedWeek(i)}
							className={`px-6 py-2 rounded-xl border transition ${
								selectedWeek === i
									? "bg-[var(--primary)] text-white border-transparent font-semibold"
									: "border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-element)]"
							}`}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* LOGOUT BUTTON */}
			<div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
				<button
					style={{
						marginLeft: "80px",
						marginTop: "10px",
						background: "#8f0000",
						width: "200px",
						height: "25px",
						opacity: ".8",
						cursor: "pointer",
						border: "none",
					}}
					onClick={resetEverything}
					className="
			px-6 py-3 rounded-xl
			bg-red-900 text-white
			border border-red-700
			shadow-lg
			hover:bg-red-700
			active:scale-95
			transition-all
		"
				>
					⚠️ Reset All Data
				</button>

				<button
					style={{
						marginLeft: "80px",
						marginTop: "10px",
						background: "#8f0000",
						width: "125px",
						height: "25px",
						opacity: ".8",
						cursor: "pointer",
					}}
					onClick={logout}
					className="
			px-6 py-3 rounded-xl
			bg-[var(--bg-card)]
			text-[var(--text-secondary)]
			border border-[var(--border)]
			shadow-lg
			hover:bg-red-600 hover:text-white hover:border-red-600
			active:scale-95
			transition-all
		"
				>
					Logout
				</button>
			</div>
		</div>
	);
}
