"use client";
export default function SidebarFriendList({ friends, sessionId }) {
    return (
        <ul
            role="list"
            className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1"
        >
            {friends.map(friend => (
                <li key={friend.id}>
                    <span className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
                        {friend.name}
                    </span>
                </li>
            ))}
        </ul>
    );
}
