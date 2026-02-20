export default function AdminPage() {
    return (
        <div className="max-w-4xl mx-auto p-8 mt-10">
            <h1 className="text-3xl font-extrabold border-b pb-4 mb-6">Admin & Moderation Panel</h1>

            <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-6 bg-white shrink">
                    <h2 className="font-bold text-xl mb-4 text-orange-600">Pending Suggestions</h2>
                    <ul className="space-y-3">
                        <li className="flex justify-between items-center text-sm border-b pb-2">
                            <span>"Tate Modern" coordinates update</span>
                            <button className="text-blue-600 hover:underline font-semibold">Review</button>
                        </li>
                        <li className="flex justify-between items-center text-sm border-b pb-2">
                            <span>New Museum: "Leeum"</span>
                            <button className="text-blue-600 hover:underline font-semibold">Review</button>
                        </li>
                    </ul>
                </div>

                <div className="border border-gray-200 rounded-xl p-6 bg-white shrink">
                    <h2 className="font-bold text-xl mb-4 text-red-600">Reported Reviews</h2>
                    <p className="text-sm text-gray-500 mb-4">No reviews currently reported for moderation.</p>
                </div>
            </div>
        </div>
    );
}
