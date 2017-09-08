
var action = function (options) {
  return new Promise(function (resolve, reject) {
    if (options.action === 'desc') {
      resolve({
        label: { en: 'WFM MainStatements' },
        description: { en: 'Add main statments to publication items from WikiFactMine' },
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/WikiFactMine_terrible_logo.svg/200px-WikiFactMine_terrible_logo.svg.png'
      })
    } else {
      reject(new Error('unknown action'))
    }
  })
}

module.exports.action = action
