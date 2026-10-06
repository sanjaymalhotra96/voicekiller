// Speech Editor: word timings of a recording and the edits made to them.

export type WordTiming = {
  word: string;
  // Seconds from the start of the recording.
  start: number;
  end: number;
};

// "Hello," -> "hello": words compare without case or punctuation.
const normalize = (word: string) =>
  word.toLowerCase().replace(/[^\p{L}\p{N}']+/gu, '');

const splitWords = (text: string) => text.split(/\s+/).filter(Boolean);

// Timings of the original words that are still in the edited text (the
// inpaint job wants deleted words left out). Words are matched in order
// with a longest-common-subsequence, so moved or repeated words keep the
// right timings.
export function keptWordTimes(
  words: readonly WordTiming[],
  editedText: string,
): WordTiming[] {
  const a = words.map(item => normalize(item.word));
  const b = splitWords(editedText).map(normalize);
  // lengths[i][j]: LCS of a[i..] and b[j..].
  const lengths = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lengths[i][j] =
        a[i] === b[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }
  const kept: WordTiming[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      kept.push(words[i]);
      i++;
      j++;
    } else if (lengths[i + 1][j] >= lengths[i][j + 1]) {
      i++;
    } else {
      j++;
    }
  }
  return kept;
}
