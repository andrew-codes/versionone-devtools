module.exports = function(initialState, reducer) {
  return (state = initialState, action) => reducer(state, action);
};
