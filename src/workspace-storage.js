const WorkspaceStorage = (() => {
  const recordKeys = ["conversations", "conversationFolders", "promptTemplates"];

  function equal(left, right) {
    if (left === right) return true;
    if (!left || !right || typeof left !== "object" || typeof right !== "object"
        || Array.isArray(left) !== Array.isArray(right)) return false;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length
      && keys.every((key) => Object.hasOwn(right, key) && equal(left[key], right[key]));
  }

  function mergeFields(base, local, latest) {
    const merged = { ...latest };
    for (const key of new Set([...Object.keys(base), ...Object.keys(local)])) {
      if (equal(base[key], local[key])) continue;
      if (Object.hasOwn(local, key)) merged[key] = local[key];
      else delete merged[key];
    }
    return merged;
  }

  function mergeSettings(base, local, latest) {
    const merged = mergeFields(base, local, latest);
    if (!equal(base.modelConfigs, local.modelConfigs)) {
      merged.modelConfigs = mergeFields(base.modelConfigs || {}, local.modelConfigs || {}, latest?.modelConfigs);
    }
    return merged;
  }

  function mergeRecords(key, base, local, latest, conflict) {
    const before = new Map(base.map((item) => [item.id, item]));
    const after = new Map(local.map((item) => [item.id, item]));
    const current = new Map(latest.map((item) => [item.id, item]));
    const added = [];

    for (const id of before.keys()) {
      if (!after.has(id)) current.delete(id);
    }
    for (const item of local) {
      const original = before.get(item.id);
      const existing = current.get(item.id);
      if (equal(item, original)) continue;
      if (!original) {
        if (existing) current.set(item.id, item);
        else added.push(item);
      } else if (existing) {
        const overlappingMessages = key === "conversations"
          && !equal(original.messages, item.messages)
          && !equal(original.messages, existing.messages)
          && !equal(existing.messages, item.messages);
        if (overlappingMessages) {
          // Preserve both histories when edits to the same message list overlap.
          added.push({ ...item, id: crypto.randomUUID() });
          conflict.value = true;
        } else {
          current.set(item.id, mergeFields(original, item, existing));
        }
      } else if (key === "conversations" && !equal(original.messages, item.messages)) {
        // A deletion in another view wins over subsequent updates from a stale view.
        conflict.value = true;
      }
    }

    return [...added, ...current.values()];
  }

  function create(storage, locks) {
    const baseline = {};
    let writes = Promise.resolve();
    let pending = 0;
    let revision = 0;

    function accept(values) {
      Object.assign(baseline, structuredClone(values));
    }

    function save(values, { replace = [] } = {}) {
      const snapshot = structuredClone(values);
      const keys = Object.keys(snapshot);
      pending += 1;
      revision += 1;
      const write = async () => {
        const latest = await storage.get(keys);
        const updates = {};
        const conflict = { value: false };
        for (const key of keys) {
          const local = snapshot[key];
          const base = baseline[key];
          if (replace.includes(key)) {
            updates[key] = local;
          } else if (!equal(base, local)) {
            if (recordKeys.includes(key)) {
              updates[key] = mergeRecords(key, base || [], local, latest[key] || [], conflict);
            } else if (key === "settings") {
              updates[key] = mergeSettings(base || {}, local, latest[key]);
            } else {
              updates[key] = local;
            }
          }
        }
        if (Object.keys(updates).length) await storage.set(updates);
        accept(snapshot);
        return conflict.value;
      };

      const result = writes.then(() => locks ? locks.request("lemon-cha.workspace-storage", write) : write());
      writes = result.catch(() => {});
      return result.finally(() => { pending -= 1; });
    }

    return {
      accept,
      save,
      get pending() { return pending; },
      get revision() { return revision; }
    };
  }

  return { create, equal };
})();
