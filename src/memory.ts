const memory = new Map<
  string,
  {
    value:
      | { type: "string"; value: string }
      | { type: "list"; value: string[] }
      | { type: "hash"; value: Record<string, string> };
    expiresAt?: number;
  }
>();

export { memory };
