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

export { repeat, asyncRepeat };
