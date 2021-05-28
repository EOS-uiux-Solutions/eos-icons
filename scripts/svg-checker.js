const fs = require('fs')
const inquirer = require('inquirer')
const { readFilesNameInFolder } = require('./utilities')

const namingConventionRegex = /^[a-z0-9]+(_[a-z0-9]+)*$/g

/* Runs every SVG name aginst a regular expression */
const checkSvgName = async (params) => {
  const { mdDir, eosDir } = params

  /* Reads all the svg files and remove the .svg from the name */
  const eosIcons = readFilesNameInFolder(eosDir)
  const eosIconsNew = eosIcons.filter(
    (ele) => ele.match(namingConventionRegex) === null
  )

  const mdIconsMd = readFilesNameInFolder(mdDir)
  const mdIconsMdNew = mdIconsMd.filter(
    (ele) => ele.match(namingConventionRegex) === null
  )

  /* Checks that the name match the regex, if not, returns it */
  return { eosIconsNew, mdIconsMdNew }
}

const renameSvgTo = async (originalFile, filePath, otherFilePath) => {
  const eosSVG = readFilesNameInFolder(filePath)
  const mdSVG = readFilesNameInFolder(otherFilePath)
  const svgCollections = [...eosSVG, ...mdSVG]

  try {
    return inquirer
      .prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Indicate the new name (without .svg): ',
          validate: function (input) {
            const done = this.async()

            !input.length
              ? done(`Field can't be blank`)
              : !input.match(namingConventionRegex)
              ? done(
                  `Wrong naming convention, please use: filename or file_name`
                )
              : svgCollections.includes(input)
              ? done(
                  `This file name already exists. Please enter a new unique name`
                )
              : done(null, true)
          }
        }
      ])
      .then((data) => {
        return fs.rename(
          `${filePath}/${originalFile}.svg`,
          `${filePath}/${data.name}.svg`,
          function (err) {
            if (err) console.log(`ERROR: ${err}`)
            console.log(
              `File was renamed from ${originalFile}.svg to ${data.name}.svg`
            )
          }
        )
      })
  } catch (error) {
    console.log('inputForModel(): ', error)
  }
}

const deleteDuplicateSvg = async (iconName) => {
  await selectIconFolder().then(async (response) => {
    if (response.answer === 'EOS (svg/)') {
      fs.unlinkSync(`./svg/material/${iconName}.svg`)
    } else {
      fs.unlinkSync(`./svg/${iconName}.svg`)
      console.log('Duplicated file from EOS is deleted!')
    }
  })
}

const selectIconFolder = async () => {
  try {
    return inquirer.prompt([
      {
        type: 'list',
        name: 'answer',
        message:
          '✅ Two icons with the same name were found, please select which one you want to keep: ',
        choices: ['EOS (svg/)', 'Material (svg/material/)']
      }
    ])
  } catch (error) {
    console.log(error)
  }
}

const svgThemeComparation = ({ filledSvgPath, outlionedSvgPath }) => {
  return new Promise((resolve, reject) => {
    try {
      const filledContent = fs.readFile(filledSvgPath)
      const outLinedContent = fs.readFile(outlionedSvgPath)

      return resolve(
        JSON.stringify(filledContent) === JSON.stringify(outLinedContent)
      )
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = {
  checkSvgName,
  renameSvgTo,
  deleteDuplicateSvg,
  svgThemeComparation
}
