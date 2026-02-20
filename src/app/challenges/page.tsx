export default function ChallengesPage() {
    return (
        <div className="max-w-3xl mx-auto p-8 mt-10 text-center">
            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🏆
            </div>
            <h1 className="text-3xl font-extrabold mb-4">Monthly Challenges</h1>
            <p className="text-gray-600 mb-8 text-lg">
                Visit 3 Contemporary Arts Museums in Europe this month to earn the Pioneer Badge!
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="flex justify-between mb-2 text-sm font-semibold">
                    <span>Progress</span>
                    <span>1 / 3</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 mb-6 relative overflow-hidden">
                    <div className="bg-orange-500 h-4 rounded-full" style={{ width: '33%' }}></div>
                </div>

                <button className="bg-black text-white px-8 py-3 rounded-lg font-bold">
                    Opt-in to Taste Matching
                </button>
                <p className="text-xs text-gray-400 mt-3">Opt-in to see and compare challenges with other users</p>
            </div>
        </div>
    );
}
