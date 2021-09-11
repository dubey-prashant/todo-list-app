exports.getDate = function() {
  var date = new Date();
  var options = {
    weekday: "long",
    day: "numeric",
    month: "short",
  };
  return date.toLocaleString("en-US", options);
}
