const shuffleLineReference = (names, n) => {
  let left = 0;
  let right = names.length;
  let count = 1;

  while(left < right) {
    if (count === n) {
      let removed = names.splice(left, 1)[0]; 
      names.push(removed);
      right -= 1;
      count = 1;
    } else {
      left += 1;
      count += 1;
    }
  }

  return names;
}

const shuffleLine = (names, n) => {
  const head = [];
  const tail = [];

  for (let i = 0; i < names.length; i++) {
    if ((i + 1) % n === 0) {
      tail.push(names[i]);
    } else {
      head.push(names[i]);
    }
  }

  return [...head, ...tail];
}

console.log(shuffleLineReference(["Ada", "Ben", "Cam", "Diya", "Eli", "Fay"], 3));
// > ['Ada', 'Ben', 'Diya', 'Eli', 'Cam', 'Fay']
// Every 3rd customer is moved to the end, so "Cam" and "Fay"
// are moved after the others, preserving their original order.

console.log(shuffleLineReference(["A", "B", "C", "D", "E"], 2));
// > ['A', 'C', 'E', 'B', 'D']

console.log(shuffleLineReference(["Mo", "Noah", "Oli"], 1));
// > ['Mo', 'Noah', 'Oli']