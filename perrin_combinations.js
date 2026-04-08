const cache = {};

const perrin = (n) => {
  if (cache[n] !== undefined) {
    return cache[n];
  }

  if (n === 0) {
    cache[n] = 3;
    return 3;
  }

  if (n === 1) {
    cache[n] = 0;
    return 0;
  }

  if (n === 2) {
    cache[n] = 2;
    return 2;
  }

  const result = perrin(n - 2) + perrin(n - 3);
  cache[n] = result;
  return result;
}

const perrinCombinations = (n, k) => {
  const perrinNumbersSet = new Set();

  for (let i = 0; i <= n; i++) {
    perrinNumbersSet.add(perrin(i))
  }

  const perrinNumbers = Array.from(perrinNumbersSet).sort()
  const result = [];

  const _perrinCombinations = (currArray, currIndex, total) => {
    if (total === k) {
      result.push(currArray);
      return;
    }
    
    if (total > k) {
      return;
    }

    for (let i = currIndex + 1; i < perrinNumbers.length; i++) {
      _perrinCombinations([...currArray, perrinNumbers[i]], i, total + perrinNumbers[i]);
    }
  }

  for (let i = 0; i < perrinNumbers.length; i++) {
    _perrinCombinations([perrinNumbers[i]], i, perrinNumbers[i]);
  }


  return result;
}


console.log(perrinCombinations(7, 12));
console.log(perrinCombinations(6, 5));