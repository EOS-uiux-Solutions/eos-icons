const fs = require('fs')
const readFiles = async (dir) => {
  try {
    const icons = await fs.readdirSync(dir, (err, filenames) => {
      if (err) console.error(err)
      return filenames
    })

    /* We filter out the subfolder (or others elements in the future) */
    const iconsContent = icons.filter((ele) => {
      return ele.includes('.svg') || ele.includes('.json') ? ele : null
    })

    /* Return the files name without the extension */
    return iconsContent.map((ele) => ele.split('.')[0])
  } catch (error) {
    /* Filtr out the erros that are not -2: Folder not found */
    console.log('ERROR: readFiles() => : ', error)
  }
}

const compareFolders = async (params) => {
  const { mdRepo, eosRepo } = params
  const eosModelsSrc = './models'
  const mdModelsSrc = './models/material'

  try {
    /* Get the two arrays with the icons for md and eos */
    const mdIcons = await readFiles(mdRepo)
    const eosIcons = await readFiles(eosRepo)

    /**
     * We compare the two arrays for matching names
     */

    const duplicatedIconsList = mdIcons.filter((element) => {
      return eosIcons.includes(element)
    })

    /* Get the two arrays with the models for md and eos */
    const mdModelsList = await readFiles(mdModelsSrc)
    const eosModelsList = await readFiles(eosModelsSrc)

    /* Identify duplicated icons with an existing model in models/material/ */
    const duplicatedEOSicon = mdModelsList.filter((value) =>
      duplicatedIconsList.includes(value)
    )

    /* Identify duplicated icons with an existing model in models/ */
    const duplicatedMDicon = eosModelsList.filter((value) =>
      duplicatedIconsList.includes(value)
    )

    return { duplicatedEOSicon, duplicatedMDicon, duplicatedIconsList }
  } catch (error) {
    console.log('ERROR: compareFolders() => : ', error)
  }
}

module.exports = {
  compareFolders
}
