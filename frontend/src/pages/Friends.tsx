import { useEffect, useState } from 'react';
import api from '../lib/axios';

export default function Friends() {
    const [friends, setFriends] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        loadFriends();
    }, []);

    const loadFriends = async () => {
        const res = await api.get('/users/friends');
        setFriends(res.data);
    };

    const handleSearch = async (e: any) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length > 2) {
            const res = await api.get(`/users/search?query=${val}`);
            setSearchResults(res.data);
        } else {
            setSearchResults([]);
        }
    };

    const addFriend = async (friendId: string) => {
        try {
            await api.post('/users/friends', { friendId });
            setModalOpen(false);
            setQuery('');
            setSearchResults([]);
            loadFriends();
        } catch (error) {
            alert("Failed to add friend or already added.");
        }
    };

    const removeFriend = async (friendId: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name} from your friends?`)) return;
        try {
            await api.delete(`/users/friends/${friendId}`);
            loadFriends();
        } catch (error) {
            alert("Failed to remove friend.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Friends</h1>
                    <p className="text-gray-400">Manage friends and track 1:1 expenses.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    + Add Friend
                </button>
            </div>

            {/* Friends Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {friends.length === 0 && (
                    <div className="col-span-full py-10 text-center text-gray-500 bg-gray-900 rounded-xl border border-gray-800 border-dashed">
                        No friends added yet.
                    </div>
                )}

                {friends.map(f => (
                    <div key={f._id} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-lg font-bold">
                                {f.username[0].toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold">{f.username}</h3>
                                <p className="text-xs text-gray-400">{f.email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => removeFriend(f._id, f.username)}
                            className="text-red-500 hover:text-red-400 transition text-sm font-medium"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            {/* Add Friend Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 w-full max-w-md p-6 rounded-2xl border border-gray-800 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add a Friend</h2>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <input
                            placeholder="Search by name or email..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-green-500 transition"
                            value={query}
                            onChange={handleSearch}
                            autoFocus
                        />

                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {searchResults.map(user => (
                                <div key={user._id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                                    <span>{user.username} <span className="text-gray-500 text-sm">({user.email})</span></span>
                                    <button
                                        onClick={() => addFriend(user._id)}
                                        className="bg-green-600 hover:bg-green-500 text-xs px-3 py-1.5 rounded"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                            {query.length > 2 && searchResults.length === 0 && (
                                <p className="text-gray-500 text-center py-2">No users found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
