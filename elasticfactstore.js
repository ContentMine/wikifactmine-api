var elasticsearch = require('elasticsearch')
var config = require('./config.js')
var _ = require('lodash')

var resultsPerPage = 100

var ESFactStore = function () {

}

var getESClient = function () {
  var client = new elasticsearch.Client({
    host: config.elasticServer,
    apiVersion: '2.4'
  })
  return client
}

var convertFactsToOutputForm = function (facts) {
  return _.map(facts, convertESLine2OutputForm)
}

var convertESLine2OutputForm = function (line) {
  if (line) {
    var lineOut = line._source
    return lineOut
  }
  return null
}

ESFactStore.prototype.getByDate = function (date, page) {
  var ESFrom = resultsPerPage * page
  return new Promise(function (resolve, reject) {
    getESClient().search({
      index: config.elasticFactIndex,
      method: 'GET',
      body: {
        from: ESFrom,
        size: resultsPerPage,
        query: {
          bool: {
            must: {
              range: {
                ingestionDate: {
                  gte: date + '||/d',
                  lt: date + '||+1d/d'
                }
              }
            }
          }
        }
      }
    })
      .then(function (results) {
        var facts = results.hits.hits
        resolve(convertFactsToOutputForm(facts))
      })
    .catch(console.log)
  })
}

ESFactStore.prototype.getByItem = function (item, page) {
  var ESFrom = resultsPerPage * page
  return new Promise(function (resolve, reject) {
    getESClient().search({
      index: config.elasticFactIndex,
      method: 'GET',
      body: {
        from: ESFrom,
        size: resultsPerPage,
        query: {
          constant_score: {
            filter: {
              term: {
                'identifiers.wikidata': item
              }
            }
          }
        }
      }
    })
    .then(function (results) {
      var facts = results.hits.hits
      resolve(convertFactsToOutputForm(facts))
    })
    .catch(console.log)
  })
}

ESFactStore.prototype.getBy2Item = function (item1, item2) {
  return new Promise(function (resolve, reject) {
    getESClient().search({
      index: config.elasticFactIndex,
      method: 'GET',
      body: {
        'query' : {
          'or': [
            {
              'bool' : {
                'must': {
                  'term': { 'identifiers.wikidata' : item1}
                }
              }
            },
            {
              'bool' : {
                'must': {
                  'term': { 'identifiers.wikidata' : item2}
                }
              }
            }
          ]
        },
        'aggs': {
          'papers': {
            'terms': {
              'field': 'cprojectID',
              'size': 20,
              'order': { 'fact_count': 'desc'}
            },
            'aggs': {
              'fact_count': {
                'cardinality': {'field': 'identifiers.wikidata'}
              },
              'documents': {
                'top_hits': {'size': 5}
              }
            }
          }
        },
        'size': 0
      }
    })
      .then(function (results) {
	var buckets = results.aggregations.papers.buckets
	var facts = _.flatMap(buckets, function (bucket) {
    if (bucket.fact_count.value === 2) {
      return bucket.documents.hits.hits
    }
    return []
  })
	resolve(convertFactsToOutputForm(facts))
      })
      .catch(console.log)
})
}

module.exports = ESFactStore
