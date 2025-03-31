const formatCount = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
export {
  formatCount
};
