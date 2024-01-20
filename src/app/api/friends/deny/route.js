import { fetchRedis } from "@/helper/redis";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req) {
    try {
        const body = await req.json();
        const session = await getServerSession(authOptions);

        if (!session) {
            return new Response("Login first to use this app.", {
                status: 401
            });
        }

        const { id: idToDeny } = z.object({ id: z.string() }).parse(body);

        await db.srem(
            `user:${session.user.id}:incoming_friend_requests`,
            idToDeny
        );

        return new Response("You denied this friend request.");
    } catch (error) {
        console.log(error);

        if (error instanceof z.ZodError) {
            return new Response("Invalid request payload", { status: 422 });
        }

        return new Response("Something went to wrong.", { status: 400 });
    }
}
