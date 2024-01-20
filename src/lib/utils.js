import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    // (...inputs) => inputs array convert
    return twMerge(clsx(inputs));
}

export function toPusherKey(key) {
    return key.replace(/:/g, "__");
}

export function chatHrefConstructor(id1, id2) {
    const sortedIds = [id1, id2].sort();
    return `${sortedIds[0]}--${sortedIds[1]}`;
}
