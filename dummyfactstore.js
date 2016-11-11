var fsp = require('fs-promise')
var _ = require('lodash')

var dummyFactStore = function() {

}

var convertESLine2OutputForm = function (line, date) {
  if (line) {
    var lineOut = line._source
    lineOut.ingestionDate = date
    return lineOut
  }
  return null
}

var convertESDump2OutputForm = function(fulldump, date) {
  //console.log('converting ES to output JSON')
  var stringLines = _.split(fulldump,'\n')
  //console.dir(stringLines)
  var jsonLines = _.map(stringLines, function(line) {
    if (line) {
      var jsonline = JSON.parse(line)
      return convertESLine2OutputForm(jsonline, date)
    }
    else {
      return null
    }
  })
  //console.log('finished mapping')
  //console.log(jsonLines)
  return new Promise(function(resolve, reject) {
    resolve(jsonLines)
  })
}

dummyFactStore.prototype.getByDate = function(date) {
  return new Promise(function(resolve, reject) {
    //console.log('reading from file')
    fsp.readFile('sample.json', {encoding:'utf8'})
    .then(function(line) { return convertESDump2OutputForm(line, date) })
    .then(resolve)
  });
}

module.exports = dummyFactStore
