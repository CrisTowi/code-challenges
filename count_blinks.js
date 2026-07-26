const countBlinks = (str) => {
  let maxGap = 0;
  let initIndex = null;


  for (let i = 0; i < str.length; i++) {
    if (str[i] === '_') {
      if (initIndex === null) {
        initIndex = i;
      } else if (initIndex !== i) {
        maxGap = Math.max(maxGap, i - initIndex - 1);
        initIndex = i;
      }
    }
  }

  return maxGap;
}

console.log(countBlinks("_..__..._....._"))
console.log(countBlinks("...._"))