export function isValidJSON(payload: string): boolean {
  try {
    JSON.parse(payload);
    return true;
  } catch (error) {
    return false;
  }
}
