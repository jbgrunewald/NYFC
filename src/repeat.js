const sleep = (timeout) => new Promise((res) => setTimeout(res, timeout));

const repeat = (func) => {
  if (func() !== undefined) {
    return repeat(func);
  }
  return undefined;
};

const asyncRepeat = async (func) => {
  const result = await func();
  if (result !== undefined) {
    return asyncRepeat(func);
  }
  return result;
};

const asyncRepeatWithRetry = async (func) => {
  const result = await func();
  if (result === 'retry') {
    await sleep(1000);
  }
  if (result !== undefined) {
    return asyncRepeatWithRetry(func);
  }
  return result;
};

export { repeat, asyncRepeat, asyncRepeatWithRetry, sleep };
