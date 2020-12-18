const fs = require('fs')
const axios = require('axios')
const inquirer = require('inquirer')
const path = require('path')

const downloadFile = async () => {
  const filePath = path.resolve(__dirname, 'md-web-data.json')
  axios({
    method: 'get',
    url: 'https://fonts.google.com/metadata/icons',
    responseType: 'stream'
  }).then((response) => {
    response.data.pipe(fs.createWriteStream(filePath))
  })
}

const eosMdIconsDifferences = async (params) => {
  const { targetDirMd, icons } = params

  try {
    const mdIcons = await fs
      .readdirSync(targetDirMd, (err, filenames) => {
        if (err) console.error(err)
        return filenames
      })
      .map((ele) => ele.replace(/\.[^/.]+$/, ''))
    const webMdIconsData = JSON.parse(
      fs.readFileSync('./scripts/md-web-data.json', 'utf8').replace(")]}'", '')
    )
    const webMdIconsCollection = webMdIconsData.icons.map((ele) => ele.name)
    const missingIconsInEos = iconsDifferences(webMdIconsCollection, mdIcons)
    const allMissingIconsInEos = iconsDifferences(missingIconsInEos, icons)

    console.log(
      `======= ${allMissingIconsInEos.length} New icons MD has that EOS doesn't =======`
    )
    console.dir(allMissingIconsInEos, { maxArrayLength: null })

    if (allMissingIconsInEos.length > 0) {
      const importMdIconsRes = await importMdIcons().then(async (response) => {
        return response
      })

      const data = {
        answer: importMdIconsRes.answer,
        iconsList: allMissingIconsInEos
      }
      return data
    } else {
      return { answer: 'No' }
    }
  } catch (error) {
    console.log(error)
    console.log(
      "Please run 'grunt eosMdIconsDifferencesLog' again to see the result."
    )
  }
}

const importMdIcons = async () => {
  try {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'answer',
        message: '✅  Do you want to import them now?: ',
        choices: ['Yes', 'No']
      }
    ])
  } catch (error) {
    console.log(error)
  }
}

const iconsDifferences = (array1, array2) =>
  array1.filter((val) => !array2.includes(val))

module.exports = {
  eosMdIconsDifferences,
  downloadFile
}
