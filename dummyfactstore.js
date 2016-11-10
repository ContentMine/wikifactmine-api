var fsp = require('fs-promise')
var _ = require('lodash')

var dummyFactStore = function() {

}

var convertESDump2OutputForm = function(fulldump) {
  var stringLines = _.split(fulldump,'\n')
  var jsonLines = _.map(stringLines, function(foo) { JSON.parse(foo) })
  console.log(jsonLines)
  return new Promise(function(resolve, reject) {
    resolve(jsonLines)
  })
}

dummyFactStore.prototype.getByDate = function() {
  return new Promise(function(resolve, reject) {
    fsp.readFile('sample.json', {encoding:'utf8'})
    .then(convertESDump2OutputForm)
    .then(resolve)
  });
}

module.exports = dummyFactStore
