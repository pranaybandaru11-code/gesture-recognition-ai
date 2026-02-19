import { useEffect, useState } from "react";
import { getAnalyticsSummary, getGestureHistory } from "../api/gestures";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, historyData] = await Promise.all([
          getAnalyticsSummary(),
          getGestureHistory(),
        ]);
        setSummary(summaryData);
        setHistory(historyData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-6">
          Analytics Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Detections</p>
            <p className="text-4xl font-bold text-white mt-1">
              {summary?.total_detections || 0}
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Avg Confidence</p>
            <p className="text-4xl font-bold text-purple-400 mt-1">
              {Math.round((summary?.average_confidence || 0) * 100)}%
            </p>
          </div>
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Unique Gestures</p>
            <p className="text-4xl font-bold text-green-400 mt-1">
              {summary?.top_gestures?.length || 0}
            </p>
          </div>
        </div>

        {/* Top Gestures */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Top Gestures</h2>
          {summary?.top_gestures?.length > 0 ? (
            <div className="space-y-3">
              {summary.top_gestures.map((g, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-gray-400 w-24 capitalize">
                    {g.gesture}
                  </span>
                  <div className="flex-1 bg-gray-800 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full"
                      style={{
                        width: `${(g.count / summary.total_detections) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-gray-400 text-sm w-8">{g.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data yet. Start detecting gestures!</p>
          )}
        </div>

        {/* Recent History */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Recent History</h2>
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-400">
                <thead>
                  <tr className="text-left border-b border-gray-800">
                    <th className="pb-3">Gesture</th>
                    <th className="pb-3">Confidence</th>
                    <th className="pb-3">Latency</th>
                    <th className="pb-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 10).map((log, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-2 capitalize">{log.gesture_name}</td>
                      <td className="py-2">
                        {Math.round(log.confidence * 100)}%
                      </td>
                      <td className="py-2">{log.latency_ms?.toFixed(1)}ms</td>
                      <td className="py-2">
                        {new Date(log.detected_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;