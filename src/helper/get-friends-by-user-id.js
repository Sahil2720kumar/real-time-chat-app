import { fetchRedis } from "./redis";

export  async function getFriendsByUserId( userId ) {
    console.log("userid", userId);
    const friendIds = await fetchRedis("smembers", `user:${userId}:friends`);
    console.log("friend ids", friendIds);

    const friends = await Promise.all(
        friendIds.map(async friendId => {
            const friend = await fetchRedis("get", `user:${friendId}`);
            const parsedFriend = JSON.parse(friend);
            return parsedFriend;
        })
    );

    return friends;
}
