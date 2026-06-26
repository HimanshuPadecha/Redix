export const decoder = (
  buffer: Buffer,
): { command: string; charsprocessed: number } | null => {
  const token = buffer.toString();

  if (!token.startsWith("*")) {
    console.log("Not staring with command length");
    return null;
  }

  let charsprocessed = 1;
  let cursor = 1;

  while (token[cursor] != "\r") {
    cursor++;
    charsprocessed++;

    if (cursor >= token.length) {
      return null;
    }
  }

  let length = parseInt(token.slice(1, cursor));

  const parsed: string[] = [];

  while (length > 0) {
    // getting to doller
    while (token[cursor] !== "$") {
      cursor++;
      charsprocessed++;

      if (cursor >= token.length) {
        return null;
      }
    }

    //skip the doller
    cursor++;
    charsprocessed++;

    if (cursor >= token.length) {
      return null;
    }

    let init = cursor;

    // get word length
    while (token[cursor] !== "\r") {
      cursor++;
      charsprocessed++;

      if (cursor >= token.length) {
        return null;
      }
    }

    let wordLen = parseInt(token.slice(init, cursor));

    // skip /r/n again
    cursor += 2;
    charsprocessed += 2;

    if (cursor >= token.length) {
      return null;
    }

    init = cursor;

    while (wordLen > 0) {
      cursor++;
      charsprocessed++;

      if (cursor >= token.length) {
        return null;
      }

      wordLen--;
    }

    const word = token.slice(init, cursor);

    parsed.push(word);
    length--;
  }

  charsprocessed += 2;

  return { command: parsed.join(" "), charsprocessed };
};
