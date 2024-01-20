import FriendRequests from "@/components/FriendRequests";
import { fetchRedis } from "@/helper/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

export default async function page() {
    
    const session = await getServerSession(authOptions);
    if (!session) notFound();

    // ids of people who sent current logged in user a friend requests
    const incomingSenderIds = await fetchRedis(
        "smembers",
        `user:${session.user.id}:incoming_friend_requests`
    );

    const incomingFriendRequests = await Promise.all(
        incomingSenderIds.map(async senderId => {
            const sender = await fetchRedis("get", `user:${senderId}`);
            const senderParsed = JSON.parse(sender);

            return {
                senderId,
                senderEmail: senderParsed.email
            };
        })
    );
    return (
        <main className="pt-8">
            <h1 className="font-bold sm:text-3xl md:text-5xl mb-8">
                Your friend requests
            </h1>
            <div className="flex flex-col gap-4">
                <FriendRequests
                    incomingFriendRequests={incomingFriendRequests}
                    sessionId={session.user.id}
                />
            </div>
        </main>
    );
}
