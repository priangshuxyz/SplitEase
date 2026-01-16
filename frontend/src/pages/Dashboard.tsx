import { useEffect, useState } from 'react';
import api from '../lib/axios';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalBalance: 0,
        youOwe: 0,
        owedToYou: 0
    });
    // This would ideally come from the backend. 
    // For now I'll create a quick aggregator on the frontend or mock it if needed.
    // Given the task size, let's implement a 'getDashboardStats' on backend or just aggregate from groups.
    // I'll assume we can aggregate from groups/friends data we fetch.

    // Let's create a quick "get all" effect or similar.
    // Actually, to make it robust, a backend endpoint `/users/dashboard` is better, but I can compute it here 
    // if I fetch all balances.

    // Let's keep it simple: Fetch all groups, sum up balances.

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/balances/dash');
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            title: "Net Balance",
            amount: stats.totalBalance,
            color: stats.totalBalance >= 0 ? "text-green-500" : "text-red-500",
            bg: "bg-gray-900",
            desc: "Overall, you are " + (stats.totalBalance >= 0 ? "owed money" : "in debt")
        },
        {
            title: "You Owe",
            amount: stats.youOwe,
            color: "text-red-500",
            bg: "bg-gray-900",
            desc: "Across your groups"
        },
        {
            title: "You're Owed",
            amount: stats.owedToYou,
            color: "text-green-500",
            bg: "bg-gray-900",
            desc: "From friends & groups"
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-400">Track balances, manage expenses, and settle debts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {cards.map((card, idx) => (
                    <div key={idx} className={`${card.bg} p-6 rounded-xl border border-gray-800 shadow-sm relative overflow-hidden group hover:border-gray-700 transition-all`}>
                        <h3 className="text-gray-400 font-medium mb-2">{card.title}</h3>
                        {loading ? (
                            <div className="h-8 w-24 bg-gray-800 rounded animate-pulse" />
                        ) : (
                            <p className={`text-4xl font-bold mb-2 ${card.color}`}>
                                {card.title === "You Owe" ? "-" : (card.amount > 0 ? "+" : "")}
                                ₹{Math.abs(card.amount)}
                            </p>
                        )}
                        <p className="text-xs text-gray-500">{card.desc}</p>
                    </div>
                ))}
            </div>

            {/* Quick Links / Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Groups Preview */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Your Groups</h3>
                        <a href="/groups" className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded transition">View All</a>
                    </div>
                    <p className="text-gray-500 text-sm">Active groups will appear here.</p>
                </div>

                {/* Friends Preview */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold">Your Friends</h3>
                        <a href="/friends" className="text-sm px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded transition">View All</a>
                    </div>
                    <p className="text-gray-500 text-sm">Friends you split with will appear here.</p>
                </div>
            </div>
        </div>
    );
}
