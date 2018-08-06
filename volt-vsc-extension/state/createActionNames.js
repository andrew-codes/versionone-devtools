module.exports = function(namespace, actionNames) {
  return actionNames.reduce(
    (prev, action) =>
      Object.assign({}, prev, {
        [action]: `${namespace}/${action}`
      }),
    {}
  );
};
