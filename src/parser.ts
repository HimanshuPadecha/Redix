export const parser = (buffer: Buffer): string | null => {
  const tokens = buffer.toString();

  // check if the buffer is complete or not ??
  const elements = tokens.split("\r\n");
  elements.pop();

  if (!elements) {
    console.log("The message is yet to come");
    return null;
  }

  const lengthToken = elements.shift();

  if (!lengthToken) {
    console.log("Command length token not found");
    return null;
  }

  if (lengthToken.length !== 2 || !lengthToken.startsWith("*")) {
    console.log("Got invalid length token ");
    return null;
  }

  const length = parseInt(lengthToken[1]!);

  if (Number.isNaN(length)) {
    console.log("Got invalid length");
    return null;
  }

  if (length * 2 !== elements.length) {
    console.log("message is incomplete");
    return null;
  }

  const parsed: string[] = [];

  for (let i = 0; i < elements.length; i += 2) {
    const len = elements[i];

    if (!len!.startsWith("$") || len!.length !== 2) {
      console.log("Invalid message length token");
      return null;
    }

    const currentLength = parseInt(len![1]!);

    if (Number.isNaN(currentLength)) {
      console.log("Invalid message token found !!");
      return null;
    }

    const message = elements[i + 1];

    if (message!.length !== currentLength) {
      console.log("Message is incomplete");
      return null;
    }

    parsed.push(message!);
  }

  return parsed.join(" ");
};
