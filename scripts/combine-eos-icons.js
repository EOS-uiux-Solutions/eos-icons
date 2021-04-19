const fs = require('fs-extra')

/** Combines both EOS and MD models into a single file
 * @param targetDirEos eos models
 * @param targetDirMd md models
 * @param destDir file destination directory
 */
const combineIconsModels = async (params) => {
  /* It takes a targetDir where the files.json are and the destination file. */
  const { targetDirEos, targetDirMd, destDir } = params

  try {
    const eosModelsArray = await readFolderContent(targetDirEos)
    const mdModelsArray = await readFolderContent(targetDirMd)

    return fs.writeFileSync(
      destDir,
      JSON.stringify([...eosModelsArray, ...mdModelsArray], null, 2)
    )
  } catch (error) {
    console.log(error)
  }
}

const showMissingOutlinedFiles = async ({
  outlineSvgDir,
  normalSvgDir,
  tempFolder
}) => {
  // Get all the outline icons version
  const outlineList = fs
    .readdirSync(outlineSvgDir, (err, file) => {
      if (err) console.log(err)
      return file
    })
    .filter((ele) => ele.includes('.svg'))

  const eosIcons = fs
    .readdirSync(normalSvgDir, (err, file) => {
      if (err) console.log(err)
      return file
    })
    .filter((ele) => ele.includes('.svg'))

  const filtered = eosIcons.filter(function (x) {
    return outlineList.indexOf(x) < 0
  })

  if (!fs.existsSync(tempFolder)) {
    console.log(true)
    return fs.mkdirSync(tempFolder)
  }

  // Move the missing files to complete the outline version
  filtered.map((icon) => {
    fs.copyFile(`${normalSvgDir}/${icon}`, `${tempFolder}/${icon}`, (err) => {
      if (err) throw err
    })
  })

  return 'Done moving files to complete the missing outlined svg for EOS'
}

const readFolderContent = async (dir) => {
  const data = []
  fs.readdirSync(dir, (err, files) => {
    if (err) console.log(err)

    return files
  }).map((file) => {
    if (file.includes('.json')) {
      data.push(JSON.parse(fs.readFileSync(`${dir}${file}`, 'utf8')))
    }
  })

  return data
}

module.exports = {
  combineIconsModels,
  showMissingOutlinedFiles,
  readFolderContent
}
