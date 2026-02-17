const printMatrix = (matrix) => {
  for (let i = 0; i < matrix.length; i++) {
    console.log(matrix[i].join(', '))
  }
}

const zoom = (matrix, zoomFactor) => {
  const result = [];
  for (let i = 0; i < matrix.length; i++) {
    const xArray = [];
    for (let j = 0; j < matrix[i].length; j++) {
      for (let x = 0; x < zoomFactor; x++) {
        xArray.push(matrix[i][j]);
      }
    }
    for (let x = 0; x < zoomFactor; x++) {
      result.push(xArray)
    }
  }

  return result;
};

printMatrix(zoom([[1, 2], [3, 4]], 4))