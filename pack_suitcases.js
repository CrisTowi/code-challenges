const packSuitcases = (weights, suitcases) => {
  const sortedWeights = weights.sort(((a, b) => b - a));
  const sortedSuitcases = suitcases.sort(((a, b) => b - a));
  const dict = {};

  for (let i = 0; i < sortedWeights.length; i++) {
    let itemFits = false;

    for (let j = 0; j < sortedSuitcases.length; j++) {
      if (sortedWeights[i] <= sortedSuitcases[j]) {
        sortedSuitcases[j] -= sortedWeights[i];
        itemFits = true;
        dict[j] = true;
        break;
      }
    }

    if (!itemFits) {
      return -1;
    }
  }

  return Object.keys(dict).length;
}

console.log(packSuitcases([4, 8, 1, 4, 2], [10, 6, 8]));
// > 3

console.log(packSuitcases([9, 7, 6], [10, 6]));
// > -1