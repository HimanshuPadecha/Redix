import type { RedisSocket } from "./types";

export const subscriptions = new Map<string, Set<RedisSocket>>();

export const subsCount = new Map<RedisSocket, number>();
