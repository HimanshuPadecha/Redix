import type { Socket } from "node:net";

export const subscriptions = new Map<string, Set<Socket>>();

export const subsCount = new Map<Socket, number>();
