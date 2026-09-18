// Remove only byte-for-byte identical records; conflicting versions remain untouched.
export function uniqueRecords<T>(records:T[]):T[] {
  const seen = new Set<string>();
  return records.filter(record=>{const key=JSON.stringify(record);if(seen.has(key))return false;seen.add(key);return true;});
}
