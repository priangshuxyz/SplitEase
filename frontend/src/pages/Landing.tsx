import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">

            {/* -------- NAVBAR -------- */}
            <header className="flex justify-between items-center px-8 py-6 border-b border-gray-800">
                <h1 className="text-xl font-semibold">SplitEase</h1>

                <div className="flex gap-4">
                    <Link
                        to="/login"
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                    >
                        Get Started
                    </Link>
                </div>
            </header>

            {/* -------- HERO SECTION -------- */}
            <main className="flex flex-col items-center text-center px-6 pt-28 pb-20">

                <h2 className="text-5xl font-bold max-w-3xl leading-tight">
                    Split expenses.
                    <span className="text-blue-500"> Settle balances.</span>
                    <br />Without the mess.
                </h2>

                <p className="text-gray-400 text-lg mt-6 max-w-2xl">
                    SplitEase helps friends, roommates, and travel groups track shared
                    expenses and instantly see who owes whom.
                </p>

                <div className="flex gap-4 mt-10">
                    <Link
                        to="/register"
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded text-lg font-medium"
                    >
                        Create Free Account
                    </Link>

                    <Link
                        to="/login"
                        className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded text-lg font-medium"
                    >
                        Sign In
                    </Link>
                </div>
            </main>

            {/* -------- FEATURES -------- */}
            <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-8">

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-xl font-semibold mb-2">
                        Simple Expense Tracking
                    </h3>
                    <p className="text-gray-400">
                        Add expenses in seconds and let SplitEase handle the math for you.
                    </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-xl font-semibold mb-2">
                        Clear Balances
                    </h3>
                    <p className="text-gray-400">
                        Instantly see who owes money and who should get paid.
                    </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                    <h3 className="text-xl font-semibold mb-2">
                        Built for Groups
                    </h3>
                    <p className="text-gray-400">
                        Perfect for trips, roommates, events, and shared lifestyles.
                    </p>
                </div>

            </section>

            {/* -------- FOOTER -------- */}
            <footer className="border-t border-gray-800 py-6 text-center text-gray-500 text-sm">
                © {new Date().getFullYear()} SplitEase. All rights reserved.
            </footer>
        </div>
    );
}
