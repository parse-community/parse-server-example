
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});
Parse.Cloud.define('bye', function(req, res) {
  res.success('Bye');
});
