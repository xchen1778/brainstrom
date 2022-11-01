function getDifference(a, b, compareFunction) {
  return a.filter(
    (aComment) => !b.some((bComment) => compareFunction(aComment, bComment))
  );
}

export { getDifference };
