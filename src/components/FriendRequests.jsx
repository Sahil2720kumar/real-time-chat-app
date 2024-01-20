"use client";
import axios from "axios";
import { pusherClient } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const FriendRequests = ({ incomingFriendRequests, sessionId }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [friendRequests, setFriendRequests] = useState(
        incomingFriendRequests
    );

    useEffect(() => {
        pusherClient.subscribe(
            toPusherKey(`user:${sessionId}:incoming_friend_requests`)
        );
        console.log(
            "listening to ",
            `user:${sessionId}:incoming_friend_requests`
        );

        const friendRequestHandler = ({ senderId, senderEmail }) => {
            setFriendRequests(prev => [...prev, { senderId, senderEmail }]);
        };

        pusherClient.bind("incoming_friend_requests", friendRequestHandler);

        return () => {
            pusherClient.unsubscribe(
                toPusherKey(`user:${sessionId}:incoming_friend_requests`)
            );
            pusherClient.unbind(
                "incoming_friend_requests",
                friendRequestHandler
            );
        };
    }, [sessionId]);

    const acceptFriend = async senderId => {
        try {
            setLoading(true);
            const res = await axios.post("/api/friends/accept", {
                id: senderId
            });
            if (res.status === 200) {
                toast.success(res.data);
            }

            if (res.status !== 200) {
                toast.error(res.data);
            }

            setFriendRequests(prev =>
                prev.filter(request => request.senderId !== senderId)
            );

            router.refresh();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
            toast.error(error.response.data);
        }
    };

    const denyFriend = async senderId => {
        try {
            setLoading(true);
            const res = await axios.post("/api/friends/deny", { id: senderId });
            if (res.status === 200) {
                toast.success(res.data);
            }

            if (res.status !== 200) {
                toast.error(res.data);
            }

            setFriendRequests(prev =>
                prev.filter(request => request.senderId !== senderId)
            );

            router.refresh();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.log(error);
            toast.error(error.response.data);
        }
    };

    return (
        <>
            {friendRequests.length === 0 ? (
                <p className="text-sm text-zinc-500">Nothing to show here...</p>
            ) : (
                friendRequests.map(request => (
                    <div
                        key={request.senderId}
                        className="flex gap-4 items-center"
                    >
                        <UserPlus className="text-black" />
                        <p className="font-medium md:text-lg">
                            {request.senderEmail}
                        </p>
                        <button
                            disabled={loading}
                            onClick={() => acceptFriend(request.senderId)}
                            ariaLabel="accept friend"
                            className="w-6 h-6 md:w-8 md:h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
                        >
                            <Check className="font-semibold text-white w-3/4 h-3/4" />
                        </button>

                        <button
                            disabled={loading}
                            onClick={() => denyFriend(request.senderId)}
                            ariaLabel="deny friend"
                            className="w-6 h-6 md:w-8 md:h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
                        >
                            <X className="font-semibold text-white w-3/4 h-3/4" />
                        </button>
                    </div>
                ))
            )}
        </>
    );
};

export default FriendRequests;
