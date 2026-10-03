// Quote a value for PostgREST logic filters (`or=(...)`), so commas,
// dots and parentheses in it are read as data. Escapes `\` and `"`.
const pgQuote = (value: string) =>
  `"${value.replace(/["\\]/g, char => `\\${char}`)}"`;

// `%` and `_` are wildcards in ILIKE; treat them as plain text.
export const escapeLike = (text: string) =>
  text.replace(/[\\%_]/g, char => `\\${char}`);

// Rows strictly after a keyset cursor, for ORDER BY <column>, id.
// `direction` is the sort direction of both columns.
export const afterKeyset = (
  column: string,
  value: string,
  id: string,
  direction: 'asc' | 'desc',
) => {
  const op = direction === 'asc' ? 'gt' : 'lt';
  return `${column}.${op}.${pgQuote(value)},and(${column}.eq.${pgQuote(
    value,
  )},id.${op}.${pgQuote(id)})`;
};
