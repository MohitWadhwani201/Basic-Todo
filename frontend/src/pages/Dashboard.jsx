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

  const navigate = useNavigate();

  const refreshStats = () => {
    setStatsRefreshKey((k) => k + 1);
  };

  // 🔐 LOGOUT HANDLER
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // ✅ LOAD CURRENT WEEK + DAY
  useEffect(() => {
    const loadCurrent = async () => {
      try {
        const res = await API.get("/current-week");

        const week =
          Number.isInteger(res.data?.weekIndex) ? res.data.weekIndex : 0;
        const day =
          Number.isInteger(res.data?.dayIndex) ? res.data.dayIndex : 0;

        setSelectedWeek(week);
        setTodayIndex(day);
      } catch (err) {
        console.error("Failed to load current week/day", err);
        setSelectedWeek(0);
        setTodayIndex(0);
      } finally {
        setLoaded(true);
      }
    };

    loadCurrent();
  }, []);

  // ⛔ BLOCK RENDER UNTIL READY
  if (!loaded || todayIndex === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <span className="text-gray-500 text-lg">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-50 flex flex-col gap-8 p-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-1">
          Week {selectedWeek + 1} progress and tasks
        </p>
      </div>

      {/* TOP GRID */}
      <div className="flex h-[45%] w-full gap-8">
        <div className="flex-1 bg-white rounded-xl shadow border p-6">
          <Stats
            selectedWeek={selectedWeek}
            refreshKey={statsRefreshKey}
          />
        </div>

        <div className="flex-1 bg-white rounded-xl shadow border p-6">
          <HabitTracker
            selectedWeek={selectedWeek}
            todayIndex={todayIndex}
          />
        </div>
      </div>

      {/* TASK MANAGER */}
      <div className="h-[45%] w-full">
        <div className="bg-white h-full rounded-2xl shadow border p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Task Manager
          </h2>
          <p className="text-gray-600 mb-6">
            Tasks for Week {selectedWeek + 1}
          </p>

          <TaskManager
            week={selectedWeek}
            todayIndex={todayIndex}
            onStatsRefresh={refreshStats}
          />
        </div>
      </div>

      {/* WEEK SWITCHER */}
      <div className="pt-6">
        <div className="bg-white rounded-2xl shadow border px-8 py-6">
          <h3 className="text-lg font-semibold text-center mb-4">
            Select Week
          </h3>

          <div className="flex justify-center gap-6">
            {["Week 1", "Week 2", "Week 3", "Week 4"].map((label, i) => (
              <button
                key={i}
                onClick={() => setSelectedWeek(i)}
                className={`px-8 py-3 rounded-xl border-2 transition ${
                  selectedWeek === i
                    ? "bg-green-50 border-green-500 text-green-700 font-semibold"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 🚪 FLOATING LOGOUT BUTTON (BOTTOM-RIGHT) */}
      <button
        onClick={logout}
        className="
          fixed bottom-6 right-6 z-50
          flex items-center justify-center
          px-6 py-3 rounded-full
          bg-red-500 text-white font-semibold
          shadow-xl hover:shadow-2xl
          hover:bg-red-600
          active:scale-95
          transition-all
        "
      >
        Logout
      </button>
    </div>
  );
}
