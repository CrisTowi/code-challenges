const minSwapsToAlternate = (s) => {
  let result = 0;
  const dict = {
    a: 0,
    b: 0,
  };

  // Counting the number of 'a's and 'b's
  for (let i = 0; i < s.length; i++) {
    if (s[i] === 'a') {
      dict.a += 1; 
    } else {
      dict.b += 1; 
    }
  }

  // If the difference between the number of 'a's and 'b's is bigger or equal than 2
  // the solution is impossible
  if (Math.abs(dict.a - dict.b) >= 2) {
    return -1;
  }

  // Calculating the prominent character so we can use it to calculate the number of swaps
  let prominentChar = s[0];

  if (dict.a > dict.b) {
    prominentChar = 'a';
  } else if (dict.b > dict.a) {
    prominentChar = 'b';
  }
 

  let expectedPosition = 0;

  for (let i = 0; i < s.length; i++) {
    if (s[i] === prominentChar) {
      result += Math.abs(i - expectedPosition);
      expectedPosition += 2;
    }
  }

  return result;
}


console.log(minSwapsToAlternate('aabb'));
// 1

console.log(minSwapsToAlternate('aaab'));
// -1

console.log(minSwapsToAlternate('aaaabbbb'));
// 6

console.log(minSwapsToAlternate('abbaababb'));
// 3