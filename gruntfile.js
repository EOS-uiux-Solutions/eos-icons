module.exports = function (grunt) {
  const { compareFolders } = require('./scripts/md-name-checker')
  const {
    combineIconsModels,
    showMissingOutlinedFiles
  } = require('./scripts/combine-eos-icons')
  const {
    checkForMissingModelsOrIcons,
    checkModelKeys,
    materialOutlineModels,
    eosIconsOutlineModels,
    outlineModelsAndSvgTest
  } = require('./scripts/models-checker')
  const { createNewModel } = require('./scripts/models-creation')
  const { checkSvgName, renameSvgTo } = require('./scripts/svg-checker')
  const { duplicatedIcons } = require('./scripts/duplicated_icons')
  const {
    eosMdIconsDifferences,
    downloadFile
  } = require('./scripts/eos-md-icons-log-differences')
  const { downloadSvgFile } = require('./scripts/download-svg')

  // Append path to your svg below
  // EOS-set and MD svg path
  const srcEosSet = ['svg/*.svg', 'svg/material/*.svg']
  const srcEosSetOutlined = ['temp/*.svg', 'temp/material/*.svg']

  grunt.initConfig({
    webfont: {
      icons: {
        src: srcEosSet,
        dest: 'dist/fonts',
        destCss: 'dist/css',
        destScss: 'dist/css',
        destLess: 'dist/css',
        options: {
          font: 'eos-icons',
          syntax: 'bootstrap',
          version: '1.0.0',
          ligatures: true,
          normalize: true,
          types: 'woff2,woff,ttf,svg,eot',
          metadata: 'something here',
          templateOptions: {
            baseClass: 'eos-icons',
            classPrefix: 'eos-',
            template: 'templates/css-template.css',
            iconsStyles: false
          },
          stylesheets: ['less', 'scss', 'css'],
          destHtml: 'dist/',
          htmlDemoTemplate: 'templates/index-template.html',
          htmlDemoFilename: 'index',
          customOutputs: [
            {
              template: 'templates/glyph-list-template.json',
              dest: 'dist/js/glyph-list.json'
            }
          ]
        }
      },
      outlined: {
        src: srcEosSetOutlined,
        dest: 'dist/outlined/fonts/',
        destCss: 'dist/outlined/css/',
        destScss: 'dist/outlined/css/',
        destLess: 'dist/outlined/css/',
        options: {
          font: 'eos-icons-outlined',
          syntax: 'bootstrap',
          version: '1.0.0',
          ligatures: true,
          normalize: true,
          types: 'woff2,woff,ttf,svg,eot',
          metadata: 'something here',
          templateOptions: {
            baseClass: 'eos-icons',
            classPrefix: 'eos-',
            template: 'templates/css-template.css',
            iconsStyles: false
          },
          stylesheets: ['less', 'scss', 'css'],
          destHtml: 'dist/outlined',
          htmlDemoTemplate: 'templates/index-template-outlined.html',
          htmlDemoFilename: 'index'
        }
      }
    },
    concat: {
      dist: {
        src: ['templates/css-webfont.css'],
        dest: 'templates/css-template.css'
      }
    },
    replace: {
      replace_metadata: {
        src: ['dist/fonts/eos-icons.svg'],
        overwrite: true,
        replacements: [
          {
            from: /<metadata>(.|\n)*?<\/metadata>/,
            to: '<metadata>Created by EOS Design System</metadata>'
          }
        ]
      }
    },
    coffee: {
      files: './scripts/eos-md-icons-log-differences',
      tasks: ['coffee']
    },
    copy: {
      outlined: {
        expand: true,
        dest: 'temp',
        cwd: 'svg-outlined/',
        src: '*'
      }
    },
    clean: {
      tempFolder: {
        src: './temp'
      },
      icons: {
        expand: true,
        cwd: './svg/material/',
        src: duplicatedIcons.map((ele) => `${ele}.svg`)
      },
      models: {
        expand: true,
        cwd: './models/material/',
        src: duplicatedIcons.map((ele) => `${ele}.json`)
      },
      dist: {
        src: './dist/'
      },
      hidden: {
        src: ['./svg/**/.DS_Store', './models/**/.DS_Store']
      }
    }
  })

  grunt.registerTask('checkMissingModelsOutlined', async function () {
    const done = this.async()

    outlineModelsAndSvgTest({
      normalSvgs: './svg',
      outlinedSvgs: './svg-outlined'
    }).then((data) => {
      const { difference } = data
      if (difference.length) {
        console.log(
          '\x1b[33m%s\x1b[0m',
          `⚠️  === WARNING === ⚠️ \n${
            difference.length
          } SVG missing: we found the outlined version of # ${difference.map(
            (ele) => ele
          )} # but not the SVG inside /svg. \n Please make sure to generate the filled version before adding the outlined one.`
        )
        process.exit(1)
      } else {
        console.log('✅  No extra outlined icons were found.')
        done()
      }
    })
  })

  /* Looks into the models and svg folders and finds the differences */
  grunt.registerTask('checkMissingModelandSVG', function () {
    const done = this.async()

    checkForMissingModelsOrIcons({
      modelsSrc: './models',
      mdModelsSrc: './models/material',
      mdIconsSrc: './svg/material',
      iconsSrc: './svg',
      animatedSrc: './animated-svg'
    }).then(async (data) => {
      const {
        SVGsMissingModelsEOS,
        SVGsMissingModelsMd,
        ModelsMissingSVGsEos,
        ModelsMissingSVGsMd
      } = data

      let SVGsMissingModels = [...SVGsMissingModelsMd, ...SVGsMissingModelsEOS]
      let ModelsMissingSVGs

      if (
        SVGsMissingModels.length ||
        ModelsMissingSVGsEos.length ||
        ModelsMissingSVGsMd.length
      ) {
        if (SVGsMissingModels.length) {
          console.log(
            `⚠️ ${
              SVGsMissingModels.length
            } SVG missing: we found models # ${SVGsMissingModels.map(
              (ele) => ele
            )} # but not the SVG inside /svg.`
          )
          process.exit(1)
        }

        if (ModelsMissingSVGsEos.length || ModelsMissingSVGsMd.length) {
          ModelsMissingSVGs = ModelsMissingSVGsEos

          console.log(
            `⚠️ ${
              ModelsMissingSVGs.length
            } EOS model missing: we found the SVG # ${ModelsMissingSVGs.map(
              (ele) => ele
            )} # but not the model inside /models. Please create one below.`
          )

          /* If any model is missing, send it to be created. */
          await createNewModel({
            ModelsMissingSVGs,
            modelsSrc: './models'
          }).then(async () => {
            if (ModelsMissingSVGsMd.length) {
              ModelsMissingSVGs = ModelsMissingSVGsMd
              console.log(
                `⚠️ ${
                  ModelsMissingSVGs.length
                } MD Model missing: we found the SVG # ${ModelsMissingSVGs.map(
                  (ele) => ele
                )} # but not the model inside ./models/material. Please create one below.`
              )

              /* If any model is missing, send it to be created. */
              await createNewModel({
                ModelsMissingSVGs,
                modelsSrc: './models/material'
              }).then(done)
            }
          })
        }
      } else {
        console.log(
          '✅  All SVGs have their corresponding model and vice versa.'
        )
        done()
      }
    })
  })

  /* Find duplictes name between our icons and MD icon set. */
  grunt.registerTask('findDuplicateNames', function () {
    const done = this.async()

    const mdRepo = './svg/material'
    const eosRepo = './svg'

    compareFolders({ mdRepo, eosRepo }).then((result) => {
      const { error, message } = result

      if (error) {
        console.log(message)
        process.exit(1)
      } else {
        console.log(message)
        done()
      }
    })
  })

  /* Combine all the models into a single file */
  grunt.registerTask('combineAllIconsModels', async function () {
    const done = this.async()

    return combineIconsModels({
      targetDirEos: './models/',
      targetDirMd: './models/material/',
      destDir: './dist/js/eos-icons.json'
    }).then(done)
  })

  /* compare MD icons in our repo and MD officical website Download MD svgs and create models */
  grunt.registerTask('importMdIcons', async function () {
    const done = this.async()

    await downloadFile()
      .then(
        eosMdIconsDifferences({
          targetDirMd: './svg/material',
          icons: duplicatedIcons
        }).then(async (res) => {
          if (res.answer === 'Yes') {
            const iconList = [...res.iconsList]
            /* Download MD svgs and create models */
            for await (const icon of iconList) {
              await downloadSvgFile(icon).then()
              done()
            }
          } else {
            done()
          }
        })
      )
      .then()
  })

  /* Checks for each models to make sure it has all the properties we expect. */
  grunt.registerTask('checkModelKeysTask', async function () {
    const done = this.async()

    return checkModelKeys().then((result) => {
      result.length
        ? console.log(
            `🚫 The following errors need fixing: \n\n  ${result.map(
              (ele) => ele
            )}`
          )
        : done()
    })
  })

  // Handle MD Icons Outline model
  grunt.registerTask('materialOutlineModels', async function () {
    const done = this.async()

    return materialOutlineModels({ modelsDir: './models/material' }).then(done)
  })

  // Handle EOS Icons Outline model
  grunt.registerTask('eosIconsOutlineModels', async function () {
    const done = this.async()

    return eosIconsOutlineModels({
      outlineSvgDir: './svg-outlined',
      modelsFolder: './models'
    }).then(done)
  })

  // Temporaty folder mix
  grunt.registerTask('temp_svg_collection', async function () {
    const done = this.async()

    showMissingOutlinedFiles({
      outlineSvgDir: './svg-outlined',
      normalSvgDir: './svg',
      tempFolder: './temp'
    }).then((data) => {
      console.log(data)
      done()
    })
  })

  /* Checks for SVGs names returns the one with a wrong naming convention */
  grunt.registerTask('checkNameConvention', async function () {
    const done = this.async()

    const mdDir = './svg/material'
    const eosDir = './svg'

    checkSvgName({ mdDir, eosDir }).then(async (result) => {
      const { eosIconsNew, mdIconsMdNew } = result

      if (eosIconsNew.length || mdIconsMdNew.length) {
        if (eosIconsNew.length) {
          for await (const icon of eosIconsNew) {
            console.log(
              `⚠️  ${icon}.svg is not matching our naming convention, please rename it below:`
            )
            await renameSvgTo(icon, eosDir)
          }
          process.exit(1)
        }

        if (mdIconsMdNew.length) {
          for await (const icon of mdIconsMdNew) {
            console.log(
              `⚠️  ${icon}.svg is not matching our naming convention, please rename it below:`
            )
            await renameSvgTo(icon, mdDir).then(done)
          }
        }
      } else {
        console.log('✅  All SVGs have correct naming convention.')
        done()
      }
    })
  })

  grunt.loadNpmTasks('grunt-webfont')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-text-replace')

  grunt.registerTask('clean:all', [
    'clean:hidden',
    'clean:dist',
    'clean:icons',
    'clean:models',
    'clean:tempFolder'
  ])
  grunt.registerTask('build', [
    'clean:all',
    'concat',
    'copy:outlined',
    'temp_svg_collection',
    'webfont:icons',
    'webfont:outlined',
    'replace',
    'combineAllIconsModels',
    'clean:tempFolder'
  ])
  grunt.registerTask('test', [
    'importMdIcons',
    'findDuplicateNames',
    'checkNameConvention',
    'checkModelKeysTask',
    'checkMissingModelandSVG',
    'materialOutlineModels',
    'eosIconsOutlineModels',
    'checkMissingModelsOutlined'
  ])
  grunt.registerTask('default', ['test', 'build'])
}
