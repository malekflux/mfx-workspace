// src/utils/deduplicate.ts
function uniqueRecords(records) {
  const seen = /* @__PURE__ */ new Set();
  return records.filter((record) => {
    const key = JSON.stringify(record);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
export {
  uniqueRecords
};
