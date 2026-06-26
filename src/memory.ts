const memory = new Map<
  string,
  {
    value:
      | { type: "string"; value: string }
      | { type: "list"; value: string[] }
      | { type: "hash"; value: Record<string, string> }
      | { type: "set"; value: Set<string> }
      | { type: "zset"; value: zsetObject[] };
    expiresAt?: number;
  }
>();

type zsetObject = {
  name: string;
  score: number;
};

export { memory };
