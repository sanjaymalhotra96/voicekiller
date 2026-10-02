// State that belongs to one signed-in user (drafts, selections) registers
// a reset here. AuthProvider calls resetUserScope() whenever the user
// changes, next to clearing the query cache, so nothing leaks between
// accounts on a shared device.

type Reset = () => void;
const resets = new Set<Reset>();

export function registerUserScope(reset: Reset) {
  resets.add(reset);
  return () => {
    resets.delete(reset);
  };
}

export function resetUserScope() {
  resets.forEach(reset => reset());
}
