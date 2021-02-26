const fs = require('fs')

// Creates a JS file from JSON
const jsFileFromJSON = async () => {
  const icons = fs.readFileSync('./dist/js/eos-icons.json')

  return fs.writeFileSync('./dist/js/eos-icons.js', `const eosIcons = ${icons}`)
}

module.exports = {
  jsFileFromJSON
}
