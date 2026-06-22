const memory = new Map<
  string,
  {
    value:
      | { type: "string"; value: string }
      | { type: "list"; value: string[] };
    expiresAt?: number;
  }
>();

export { memory };
