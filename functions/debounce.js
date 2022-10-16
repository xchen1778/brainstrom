function debounce(callback, interval) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback(...args);
    }, interval);
  };
}

export { debounce };
