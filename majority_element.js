const majorityElement = (arr) => {
  let result = null;
  let counter = 0;

  for (let i = 0; i < arr.length; i++) {
    if (i === 0) {
      result = arr[i];
      counter = 1;
    } else if (arr[i] === result) {
      counter += 1;
    } else {
      counter -= 1;
    }
  }

  return result;
}


console.log(majorityElement([2, 2, 1, 1, 2, 2, 1, 2, 2]))
console.log(majorityElement([3, 3, 4, 2, 3, 3, 1]))