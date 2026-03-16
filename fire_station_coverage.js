const fireStationCoverage = (city) => {
  const queue = [];
  const visited = {};

  // Initialize the queue with all the fire stations and set
  // their item in the city grid as 0
  for (let i = 0; i < city.length; i++) {
    for (let j = 0; j < city[i].length; j++) {
      if (city[i][j] === 1) {
        city[i][j] = 0;
        queue.push([i, j]);
        visited[`${i},${j}`] = true;
      }
    }
  }

  // Get all the directions array to avoid hardcoding the if statements
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (queue.length > 0) {
    // Get the current item and start getting their adjacent items to the
    // current value + 1, indicating that the distance has increased
    const item = queue.shift();
    const currentVal = city[item[0]][item[1]];

    // Go through all the directions array
    for (let d = 0; d < directions.length; d++) {
      const i = item[0] + directions[d][0];
      const j = item[1] + directions[d][1];

      // If the item is inside the city boundaries and has not yet visited,
      // set the value to the currentVal + 1 and then mark it as visited
      // and finally add that item to the queue to evaluate its corresponding
      // adjacent items
      if (
        !visited[`${i},${j}`] &&
        i >= 0 && i < city.length &&
        j >= 0 && j < city[0].length
      ) {
        city[i][j] = currentVal + 1;
        visited[`${i},${j}`] = true;
        queue.push([i, j]);
      }
    }
  }

  return city;
}

console.log(fireStationCoverage([
  [2, 0, 1],
  [0, 2, 0],
  [1, 0, 2]
]));

console.log(fireStationCoverage([
  [1, 0, 0, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [1, 0, 0, 1]
]));