import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function Groups() {
    const { user } = useAuth();

    const [groups, setGroups] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);

    // Data Caches
    const [balancesByGroup, setBalancesByGroup] = useState<Record<string, any>>({});
    const [expensesByGroup, setExpensesByGroup] = useState<Record<string, any[]>>({});
    const [settlementsByGroup, setSettlementsByGroup] = useState<Record<string, any[]>>({});

    // Forms
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

    // Add Member Modal
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [targetGroupId, setTargetGroupId] = useState<string | null>(null);

    /* ---------------- LOADERS ---------------- */

    const loadBalances = async (groupId: string) => {
        const res = await api.get(`/balances/${groupId}`);
        setBalancesByGroup(prev => ({ ...prev, [groupId]: res.data }));
    };

    const loadExpenses = async (groupId: string) => {
        const res = await api.get(`/expenses/group/${groupId}`);
        setExpensesByGroup(prev => ({ ...prev, [groupId]: res.data }));
    };

    const loadSettleUp = async (groupId: string) => {
        try {
            const res = await api.get(`/balances/settle/${groupId}`);
            if (Array.isArray(res.data)) {
                setSettlementsByGroup(prev => ({ ...prev, [groupId]: res.data }));
            }
        } catch (err) {
            return;
        }
    };

    const loadGroupData = async (groupId: string) => {
        await Promise.all([
            loadExpenses(groupId),
            loadBalances(groupId),
            loadSettleUp(groupId),
        ]);
    };

    const loadGroups = async () => {
        const res = await api.get('/groups/my');
        setGroups(res.data);
        res.data.forEach((g: any) => loadGroupData(g._id));
    };

    const loadFriends = async () => {
        const res = await api.get('/users/friends');
        setFriends(res.data);
    };

    /* ---------------- EFFECT ---------------- */

    useEffect(() => {
        loadGroups();
        loadFriends();
    }, []);


    /* ---------------- ACTIONS ---------------- */

    const createGroup = async () => {
        if (!newGroupName) return;
        try {
            await api.post('/groups', {
                name: newGroupName,
                members: selectedFriends
            });
            setNewGroupName('');
            setSelectedFriends([]);
            setShowCreateModal(false);
            loadGroups();
        } catch (error) {
            console.error(error);
            alert("Failed to create group");
        }
    };

    const addMemberToGroup = async (friendId: string) => {
        if (!targetGroupId) return;
        try {
            await api.post(`/groups/${targetGroupId}/members`, { memberId: friendId });
            setShowAddMemberModal(false);
            setTargetGroupId(null);
            loadGroups(); // Reload to show new member
        } catch (error) {
            alert('Failed to add member');
        }
    };

    const toggleFriendSelection = (friendId: string) => {
        if (selectedFriends.includes(friendId)) {
            setSelectedFriends(prev => prev.filter(id => id !== friendId));
        } else {
            setSelectedFriends(prev => [...prev, friendId]);
        }
    };

    const addExpense = async (groupId: string) => {
        if (!description || !amount) return;

        setLoading(true);
        try {
            await api.post('/expenses', {
                groupId,
                description,
                amount: Number(amount),
            });
            setDescription('');
            setAmount('');
            await loadGroupData(groupId);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const paySettlement = async (groupId: string, to: string, amount: number) => {
        await api.post(`/balances/settle/${groupId}`, { to, amount });
        await loadGroupData(groupId);
    };

    const openAddMemberModal = (groupId: string) => {
        setTargetGroupId(groupId);
        setShowAddMemberModal(true);
    };

    const deleteGroup = async (groupId: string) => {
        if (!confirm("Are you sure you want to delete this group? This cannot be undone.")) return;
        try {
            await api.delete(`/groups/${groupId}`);
            loadGroups();
        } catch (error) {
            alert("Failed to delete group");
        }
    };

    const removeMember = async (groupId: string, memberId: string) => {
        if (!confirm("Remove this member?")) return;
        try {
            await api.delete(`/groups/${groupId}/members/${memberId}`);
            loadGroups();
        } catch (error) {
            alert("Failed to remove member");
        }
    };

    const deleteExpense = async (expenseId: string, groupId: string) => {
        if (!confirm("Delete this expense?")) return;
        try {
            await api.delete(`/expenses/${expenseId}`);
            await loadGroupData(groupId);
        } catch (error) {
            console.error(error);
            alert("Failed to delete expense");
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    /* ---------------- UI ---------------- */

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Groups</h1>
                    <p className="text-gray-400">Manage expenses with your squads.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    + New Group
                </button>
            </div>

            <div className="grid gap-6">
                {groups.map(g => {
                    const balances = balancesByGroup[g._id] || {};
                    const expenses = expensesByGroup[g._id] || [];
                    const settlements = settlementsByGroup[g._id] || [];

                    return (
                        <div key={g._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-gray-900/50">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold">{g.name}</h2>
                                        {/* Add Member Button - Visible to everyone or just admin? Usually just admin/creator for control */}
                                        <button
                                            onClick={() => openAddMemberModal(g._id)}
                                            className="text-xs bg-gray-800 hover:bg-gray-700 text-green-400 px-2 py-1 rounded transition"
                                            title="Add Member"
                                        >
                                            + Add Member
                                        </button>

                                        {/* Delete Group Button - Admin Only */}
                                        {user?.id === g.createdBy && (
                                            <button
                                                onClick={() => deleteGroup(g._id)}
                                                className="text-xs bg-gray-800 hover:bg-red-900/30 text-red-400 px-2 py-1 rounded transition"
                                                title="Delete Group"
                                            >
                                                Delete Group
                                            </button>
                                        )}
                                    </div>

                                    {/* Members List with Remove Option */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {g.members.map((m: any) => (
                                            <span key={m._id} className="text-sm bg-gray-800 px-2 py-1 rounded flex items-center gap-1 group/member">
                                                <span className="text-gray-300">{m.username}</span>
                                                {user?.id === g.createdBy && m._id !== user?.id && (
                                                    <button
                                                        onClick={() => removeMember(g._id, m._id)}
                                                        className="text-gray-500 hover:text-red-400 ml-1 opacity-0 group-hover/member:opacity-100 transition-opacity"
                                                        title="Remove Member"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <span className="bg-gray-800 text-xs px-2 py-1 rounded text-gray-300">
                                    {g.members.length} members
                                </span>
                            </div>

                            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* EXPENSES LIST */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Add Expense Form */}
                                    <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col sm:flex-row gap-2">
                                        <input
                                            className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded focus:border-green-500 outline-none"
                                            placeholder="Description"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                        />
                                        <input
                                            className="w-32 p-2 bg-gray-900 border border-gray-700 rounded focus:border-green-500 outline-none"
                                            placeholder="Amount"
                                            type="number"
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                        />
                                        <button
                                            onClick={() => addExpense(g._id)}
                                            disabled={loading}
                                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Expenses</h3>
                                        {expenses.length === 0 && <p className="text-gray-500 text-sm">No expenses yet.</p>}
                                        {expenses.map(exp => (
                                            <div key={exp._id} className="flex justify-between items-center bg-gray-800/30 p-3 rounded hover:bg-gray-800/50 transition group/expense">
                                                <div>
                                                    <div className="font-medium">{exp.description}</div>
                                                    <div className="text-xs text-gray-500">{formatDate(exp.createdAt)}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-green-400">₹{exp.amount}</span>
                                                    {/* Delete Expense - Payer or Group Admin */}
                                                    {(user?.id === exp.paidBy._id || user?.id === g.createdBy) && (
                                                        <button
                                                            onClick={() => deleteExpense(exp._id, g._id)}
                                                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover/expense:opacity-100 transition-opacity"
                                                            title="Delete Expense"
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* SIDEBAR INFO */}
                                <div className="space-y-6">
                                    {/* Balances */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Balances</h3>
                                        <div className="space-y-2">
                                            {Object.entries(balances).map(([uid, amt]: any) => {
                                                const member = g.members.find((m: any) => m._id === uid);
                                                if (!member) return null;
                                                return (
                                                    <div key={uid} className="flex justify-between text-sm">
                                                        <span>{member.username}</span>
                                                        {amt > 0 && <span className="text-green-400 font-medium">gets ₹{amt}</span>}
                                                        {amt < 0 && <span className="text-red-400 font-medium">owes ₹{Math.abs(amt)}</span>}
                                                        {amt === 0 && <span className="text-gray-500">settled</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Settle Up */}
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Settle Up</h3>
                                        {settlements.length === 0 && <p className="text-gray-500 text-sm">All settled up! 🎉</p>}
                                        <div className="space-y-3">
                                            {settlements.map((s, idx) => {
                                                const from = g.members.find((m: any) => m._id === s.from);
                                                const to = g.members.find((m: any) => m._id === s.to);
                                                const isPayer = user?.id === s.from;

                                                return (
                                                    <div key={idx} className="bg-gray-800 p-3 rounded text-sm">
                                                        <div className="mb-2">
                                                            {isPayer
                                                                ? <span className="text-red-300">You owe {to?.username}</span>
                                                                : <span className="text-green-300">{from?.username} owes {user?.id === s.to ? 'you' : to?.username}</span>
                                                            }
                                                            <div className="flex justify-between items-end mt-1">
                                                                <div className="font-bold text-lg">₹{s.amount}</div>
                                                                <div className="text-xs text-gray-500">{formatDate(s.createdAt)}</div>
                                                            </div>
                                                        </div>
                                                        {isPayer && (
                                                            <button
                                                                onClick={() => paySettlement(g._id, s.to, s.amount)}
                                                                className="w-full bg-green-600 hover:bg-green-500 py-1 rounded text-xs font-semibold"
                                                                title="Mark as Paid"
                                                            >
                                                                Mark Paid
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CREATE GROUP MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 w-full max-w-md p-6 rounded-2xl border border-gray-800 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Create New Group</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Group Name</label>
                                <input
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:border-green-500 outline-none"
                                    placeholder="e.g. Trip to Goa"
                                    value={newGroupName}
                                    onChange={e => setNewGroupName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Add Friends</label>
                                <div className="max-h-40 overflow-y-auto space-y-2 border border-gray-800 rounded-lg p-2 bg-gray-800/30">
                                    {friends.length === 0 && <p className="text-gray-500 text-sm text-center">No friends found. Add some first!</p>}
                                    {friends.map(f => (
                                        <div
                                            key={f._id}
                                            onClick={() => toggleFriendSelection(f._id)}
                                            className={`p-2 rounded cursor-pointer flex items-center justify-between border ${selectedFriends.includes(f._id) ? 'bg-green-900/30 border-green-600' : 'border-transparent hover:bg-gray-800'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                                                    {f.username[0]}
                                                </div>
                                                <span>{f.username}</span>
                                            </div>
                                            {selectedFriends.includes(f._id) && <span className="text-green-500">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={createGroup}
                                disabled={!newGroupName}
                                className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD MEMBER MODAL */}
            {showAddMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 w-full max-w-sm p-6 rounded-2xl border border-gray-800 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Add Member</h2>
                            <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {friends.map(f => {
                                // Check if friend is already in data (Optional optimization)
                                const isAlreadyMember = groups.find(g => g._id === targetGroupId)?.members.some((m: any) => m._id === f._id);
                                if (isAlreadyMember) return null;

                                return (
                                    <div key={f._id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                                                {f.username[0]}
                                            </div>
                                            <span>{f.username}</span>
                                        </div>
                                        <button
                                            onClick={() => addMemberToGroup(f._id)}
                                            className="bg-green-600 hover:bg-green-500 text-xs px-3 py-1.5 rounded"
                                        >
                                            Add
                                        </button>
                                    </div>
                                );
                            })}
                            {/* If all friends are members or no friends */}
                            {friends.length === 0 && <p className="text-gray-500 text-sm text-center">No friends to add.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
