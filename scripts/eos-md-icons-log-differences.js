const fs = require('fs')
const axios = require('axios')
const inquirer = require('inquirer')
const path = require('path')
const { readFilesInFolder } = require('./utilities')

/**
 * Downloads material icons list
 * @param {string} path Optional destination path, default set to scripts/md-web-data.json
 * @returns json file
 */
const downloadMaterialIconsList = async (dest = 'md-web-data.json') => {
  try {
    const filePath = path.resolve(__dirname, dest)

    return await axios({
      method: 'get',
      url: 'https://fonts.google.com/metadata/icons',
      responseType: 'stream'
    }).then((response) => {
      response.data.pipe(fs.createWriteStream(filePath))
    })
  } catch (error) {
    console.log('error: ', error)
  }
}

/**
 * // TODO: Fill this
 * @param {string} targetDirMd material svgs src
 * @param {string} duplicatedIconsList duplicated items list
 * @returns {} yes/no response
 */
const eosMdIconsDifferences = async (params) => {
  const { targetDirMd, duplicatedIconsList } = params

  try {
    const mdIcons = readFilesInFolder(targetDirMd)

    const webMdIconsData = JSON.parse(
      fs.readFileSync('./scripts/md-web-data.json', 'utf8').replace(")]}'", '')
    )

    const webMdIconsCollection = webMdIconsData.icons.map((ele) => ele.name)
    const missingIconsInEos = iconsDifferences(webMdIconsCollection, mdIcons)
    const allMissingIconsInEos = iconsDifferences(
      missingIconsInEos,
      duplicatedIconsList
    )

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
  downloadMaterialIconsList
}
