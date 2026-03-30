const fs = {
  "/a": "/b",
  "/b": "/c",
  "/c": null,
  "/loop1": "/loop2",
  "/loop2": "/loop1",
  "/real": null,
  "/alias": "/real",
};

const resolvePath = (fsObj, path) => {
  const _resolvePath = (currPath) => {
    if (fsObj[currPath] === null) {
      return currPath;
    }

    if (fsObj[currPath] === path) {
      return null;
    }

    return _resolvePath(fsObj[currPath])
  }

  return _resolvePath(path);
}

console.log(resolvePath(fs, "/a"));      // "/c"
console.log(resolvePath(fs, "/alias"));  // "/real"
console.log(resolvePath(fs, "/loop1"));  // null
console.log(resolvePath(fs, "/real"));   // "/real"