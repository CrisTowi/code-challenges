const maxPatternCopies = (s, pattern) => {
  const sDict = {};
  const patternDict = {};
  let wildcards = 0;
  let result = 0;

  for (let c of pattern) {
    if (!patternDict.hasOwnProperty(c)) {
      patternDict[c] = 1
      sDict[c] = 0;
    } else {
      patternDict[c] += 1;
    }
  }

  for (let c of s) {
    if (c === '?') {
      wildcards += 1;
    } else {
      if (sDict.hasOwnProperty(c)) {
        sDict[c] += 1;
      }
    }
  }

  // Compare the pattern with the string and then fill the missing char
  // counts with wildcards
  while (wildcards > 0) {
    // Fill the missing pattern checks with wildcards
    for (let key in sDict) {
      // If need wildcards
      if (sDict[key] < patternDict[key]) {
        const diff = patternDict[key] - sDict[key];
        wildcards -= diff;
        sDict[key] = 0;
      } else {
        sDict[key] = sDict[key] - patternDict[key];
      }
    }    

    if (wildcards >= 0) {
      result += 1;
    }
  }

  return result;
}

console.log(maxPatternCopies("abcabc???", "ac"))  // 3
console.log(maxPatternCopies("aab??", "aab"))  // 1
console.log(maxPatternCopies("?????abc", "abc"))  // 2