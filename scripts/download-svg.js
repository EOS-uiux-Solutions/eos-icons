const fs = require('fs')
const axios = require('axios')
const inquirer = require('inquirer')
const path = require('path')

let nameIcon
const eosIconsList = './svg'
const mdIconsList = './svg/material'

const eosIcons = fs.readdirSync(eosIconsList).map((ele) => ele.split('.')[0])
const mdIcons = fs.readdirSync(mdIconsList).map((ele) => ele.split('.')[0])
const svgCollection = [...eosIcons, ...mdIcons]

const inputForName = async () => {
  try {
    return inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '✅  Enter the new icon name: ',
        validate: function (input) {
          const done = this.async()

          if (svgCollection.includes(input)) {
            done(`Already exists`)
          } else {
            done(null, true)
          }
        }
      }
    ])
  } catch (error) {
    console.log(error)
  }
}

const downloadSvgFile = async (mdIcon) => {
  const webMdIconsData = JSON.parse(
    fs.readFileSync('./scripts/md-web-data.json', 'utf8').replace(")]}'", '')
  )
  const mdSvg = webMdIconsData.icons.filter((icon) => mdIcon === icon.name)

  if (svgCollection.includes(mdSvg[0].name)) {
    console.log(
      `An existing icon with the same name was found: ${mdSvg[0].name}.svg`
    )
    await inputForName().then(async (response) => {
      nameIcon = response.name
    })
  } else {
    nameIcon = mdSvg[0].name
  }

  const downloadFiles = async (mdSvg) => {
    const filePath = path.resolve(__dirname, `../svg/material/${nameIcon}.svg`)
    const url = `https://fonts.gstatic.com/s/i/materialicons/${mdSvg[0].name}/v${mdSvg[0].version}/24px.svg`
    const file = fs.createWriteStream(filePath)

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
    response.data.pipe(file)
  }

  await downloadFiles(mdSvg).then(() => {
    createSvgModels(mdSvg, nameIcon)
  })
}

const createSvgModels = async (mdSvg, nameIcon) => {
  const today = new Date().toLocaleDateString()
  const newObject = {
    name: nameIcon,
    do: '',
    dont: '',
    tags: mdSvg[0].tags,
    category: mdSvg[0].categories,
    type: 'static',
    label: 'None',
    date: today
  }

  fs.writeFileSync(
    `./models/material/${nameIcon}.json`,
    JSON.stringify(newObject, null, 2),
    function (err) {
      if (err) {
        console.log(err)
      }
    }
  )
}

module.exports = {
  downloadSvgFile
}
