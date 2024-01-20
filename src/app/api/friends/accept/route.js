import { fetchRedis } from "@/helper/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req) {
    try {
        const body = await req.json();

        const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response("Login first to use this app.", {
                status: 401
            });
        }

        // verify both users are not already friends
        const isAlreadyFriends = await fetchRedis(
            "sismember",
            `user:${session.user.id}:friends`,
            idToAdd
        );

        if (isAlreadyFriends) {
            return new Response("Already friends", { status: 400 });
        }

        const hasFriendRequest = await fetchRedis(
            "sismember",
            `user:${session.user.id}:incoming_friend_requests`,
            idToAdd
        );

        if (!hasFriendRequest) {
            return new Response("No friend request", { status: 400 });
        }

        const [userRaw, friendRaw] = await Promise.all([
            fetchRedis("get", `user:${session.user.id}`),
            fetchRedis("get", `user:${idToAdd}`)
        ]);

        const user = JSON.parse(userRaw);
        const friend = JSON.parse(friendRaw);


        // notify added user

        await Promise.all([
            pusherServer.trigger(
                toPusherKey(`user:${idToAdd}:friends`),
                "new_friend",
                user
            ),
            pusherServer.trigger(
                toPusherKey(`user:${session.user.id}:friends`),
                "new_friend",
                friend
            ),
            db.sadd(`user:${session.user.id}:friends`, idToAdd),
            db.sadd(`user:${idToAdd}:friends`, session.user.id),
            db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd)
        ]);

        return new Response("Friend request accepted successfully.");
    } catch (error) {
        console.log(error);

        if (error instanceof z.ZodError) {
            return new Response("Invalid request payload", { status: 422 });
        }

        return new Response("Something went to wrong.", { status: 400 });
    }
}
