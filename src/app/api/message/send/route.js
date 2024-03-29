import { fetchRedis } from "@/helper/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { messageValidator } from "@/lib/validators/message";
import { nanoid } from "nanoid";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { getServerSession } from "next-auth";

export async function POST(req) {
    try {
        const { text, chatId } = await req.json();
        const session = await getServerSession(authOptions);

        if (!session)
            return new Response("Unauthorized User.", { status: 401 });

        const [userId1, userId2] = chatId.split("--");

        if (session.user.id !== userId1 && session.user.id !== userId2) {
            return new Response("Unauthorized User.", { status: 401 });
        }

        const friendId = session.user.id === userId1 ? userId2 : userId1;

        const friendList = await fetchRedis(
            "smembers",
            `user:${session.user.id}:friends`
        );
        const isFriend = friendList.includes(friendId);

        if (!isFriend) {
            return new Response("Unauthorized User.", { status: 401 });
        }

        const rawSender = await fetchRedis("get", `user:${session.user.id}`);
        const sender = JSON.parse(rawSender);

        const timestamp = Date.now();

        const messageData = {
            id: nanoid(),
            senderId: session.user.id,
            text,
            timestamp
        };

        const message = messageValidator.parse(messageData);

        // notify all connected chat room clients
        await pusherServer.trigger(
            toPusherKey(`chat:${chatId}`),
            "incoming-message",
            message
        );

        await pusherServer.trigger(
            toPusherKey(`user:${friendId}:chats`),
            "new_message",
            {
                ...message,
                senderImg: sender.image,
                senderName: sender.name
            }
        );

        // all valid, send the message
        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message)
        });

        return new Response("OK");
    } catch (error) {
        if (error instanceof Error) {
            return new Response(error.message, { status: 500 });
        }

        return new Response("Internal Server Error", { status: 500 });
    }
}
