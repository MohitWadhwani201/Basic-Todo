import { useEffect, useState } from "react";
import API from "../api/api";
import { Bar, Doughnut } from "react-chartjs-2";
import "chart.js/auto";

export default function Stats({ selectedWeek, refreshKey }) {
	const [stats, setStats] = useState(null);

	const loadStats = async (week = selectedWeek) => {
		const res = await API.get(`/stats?week=${week}`);
		setStats(res.data);
	};
	useEffect(() => {
		loadStats();
	}, [selectedWeek, refreshKey]);

	useEffect(() => {
		loadStats();
		window.refreshStats = loadStats;
	}, [selectedWeek]);

	if (!stats)
		return (
			<div className="w-full h-full flex items-center justify-center bg-gray-900">
				<div className="text-gray-400">Loading...</div>
			</div>
		);

	const { completedTasks, totalTasks, weekly } = stats;

	const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

	// Bar Chart Data
	const barData = {
		labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		datasets: [
			{
				label: "Completed",
				data: weekly,
				backgroundColor: "#10b981",
				borderRadius: 6,
				barThickness: 22,
			},
		],
	};

	const barOptions = {
		plugins: {
			legend: { display: false },
			tooltip: { enabled: true },
		},
		scales: {
			x: {
				grid: {
					display: false,
					color: "rgba(255,255,255,0.1)",
				},
				ticks: {
					color: "#9ca3af",
				},
			},
			y: {
				min: 0,
				grid: {
					color: "rgba(255,255,255,0.1)",
				},
				ticks: {
					stepSize: 1,
					color: "#9ca3af",
				},
			},
		},
		maintainAspectRatio: false,
	};

	// Donut Data
	const donutData = {
		labels: ["Done", "Remaining"],
		datasets: [
			{
				data: [percent, 100 - percent],
				backgroundColor: ["#10b981", "rgba(75,85,99,0.3)"],
				cutout: "80%",
				borderWidth: 0,
			},
		],
	};

	const donutOptions = {
		plugins: {
			legend: { display: false },
			tooltip: { enabled: false },
		},
		maintainAspectRatio: false,
	};

	return (
		<div className="w-full h-full flex flex-col bg-black p-6 text-white">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h3 className="text-xl font-bold">Overall Progress</h3>
					<p className="text-neutral-400">Weekly completion</p>
					<p className="mt-2 font-semibold text-green-400 text-lg">{percent}%</p>
				</div>

				<div className="relative w-28 h-28">
					<Doughnut data={donutData} options={donutOptions} />
					<div className="absolute inset-0 flex items-center justify-center font-bold text-white">
						{percent}%
					</div>
				</div>
			</div>

			<div className="flex-1 mt-8 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
				<Bar data={barData} options={barOptions} />
			</div>
		</div>
	);
}
