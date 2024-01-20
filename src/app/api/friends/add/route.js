import { fetchRedis } from "@/helper/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { addFriendValidator } from "@/lib/validators/add-friend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req) {
    try {
        const body = await req.json();
        const { email: emailToAdd } = addFriendValidator.parse(body.email);

        //check whether email exsits or not
        const idToAdd = await fetchRedis("get", `user:email:${emailToAdd}`);
        if (!idToAdd) {
            return new Response("This person does not exist.", { status: 400 });
        }
        console.log(idToAdd); // id user to add

        //check user is login or not
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response("Login first to use this app.", {
                status: 401
            });
        }

        if (idToAdd === session.user.id) {
            return new Response("You cannot add yourself as a friend", {
                status: 400
            });
        }

        // check if user is already added and sismember return 0 and 1
        const isAlreadyAdded = await fetchRedis(
            "sismember",
            `user:${idToAdd}:incoming_friend_requests`,
            session.user.id
        );

        if (isAlreadyAdded) {
            return new Response("Already added this user", { status: 400 });
        }

        // check if user is already in friends
        const isAlreadyFriends = await fetchRedis(
            "sismember",
            `user:${session.user.id}:friends`,
            idToAdd
        );

        if (isAlreadyFriends) {
            return new Response("Already friends with this user", {
                status: 400
            });
        }

        // valid request, send friend request
        await pusherServer.trigger(
            toPusherKey(`user:${idToAdd}:incoming_friend_requests`),
            "incoming_friend_requests",
            {
                senderId: session.user.id,
                senderEmail: session.user.email,
                senderName:session.user.name,
                unseenRequestCountAdd:1
            }
        );

        await db.sadd(
            `user:${idToAdd}:incoming_friend_requests`,
            session.user.id
        );

        return new Response("OK");
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request payload", { status: 422 });
        }

        return new Response("Invalid request", { status: 400 });
    }
}
