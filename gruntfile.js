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
  const {
    checkSvgName,
    renameSvgTo,
    deleteDuplicateSvg
  } = require('./scripts/svg-checker')

  const duplicatedIcons = require('./scripts/duplicated_icons.json')
  const newMdIconsList = require('./scripts/new-md-icons-list.json')
  const {
    eosMdIconsDifferences,
    downloadFile
  } = require('./scripts/eos-md-icons-log-differences')
  const { downloadMDFile } = require('./scripts/download-svg')
  const { jsFileFromJSON } = require('./scripts/utilities')

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
        dest: 'dist/fonts/outlined',
        destCss: 'dist/css/outlined',
        destScss: 'dist/css/outlined',
        destLess: 'dist/css/outlined',
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
          stylesheets: ['less', 'scss', 'css']
        }
      }
    },
    svgmin: {
      options: {
        plugins: [
          'removeDoctype',
          'removeXMLProcInst',
          'removeComments',
          'removeMetadata',
          'removeEditorsNSData',
          'cleanupAttrs',
          'inlineStyles',
          'cleanupIDs',
          'removeUselessDefs',
          'removeUnknownsAndDefaults',
          'removeNonInheritableGroupAttrs',
          'removeUselessStrokeAndFill',
          { removeDimensions: true },
          { removeViewBox: false },
          'cleanupEnableBackground',
          'removeHiddenElems',
          'removeEmptyText',
          { moveElemsAttrsToGroup: false },
          { moveGroupAttrsToElems: false },
          { convertPathData: false },
          { convertTransform: false },
          'removeEmptyAttrs',
          'removeEmptyContainers',
          'removeUnusedNS',
          'removeTitle',
          'removeDesc',
          'removeScriptElement',
          'removeStyleElement',
          'removeOffCanvasPaths',
          { mergePaths: false },
          { convertShapeToPath: false },
          {
            removeRect: {
              type: 'perItem',
              name: 'removeSvgId',
              description: 'Removes the Rect element',
              fn: function (item) {
                return !item.isElem('rect')
              }
            }
          },
          {
            removeFill: {
              type: 'perItem',
              name: 'removeFill',
              description:
                'Removes the Fill attr from the <svg> <path> element',
              fn: function (item) {
                if (item.isElem('svg')) {
                  item.removeAttr('fill')
                }
              }
            }
          },
          {
            removeUnusedPath: {
              type: 'perItem',
              name: 'removeUnusedPath',
              description: 'Removes the removeUnusedPath',
              fn: function (item) {
                if (item.isElem('path')) {
                  const pathValues = [
                    'M0 0h24v24H0z',
                    'M0 0h24v24H0z',
                    'M0,0h24v24H0V0z'
                  ]

                  for (let i = 0; i < pathValues.length; i++) {
                    if (item.attrs.d.value === pathValues[i]) {
                      return !item.isElem('path')
                    }
                  }
                }
              }
            }
          },
          {
            removeAttrs: {
              attrs: ['width', 'height']
            }
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'svg/material/',
            src: [newMdIconsList.map((ele) => `${ele}.svg`)],
            dest: 'svg/material/',
            ext: '.svg',
            extDot: 'first'
          }
        ]
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
      },
      newIcons: {
        dest: 'dist/js/new-icons.js',
        src: './scripts/demos/new-icons.js'
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

      const SVGsMissingModels = [
        ...SVGsMissingModelsMd,
        ...SVGsMissingModelsEOS
      ]

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

    compareFolders({ mdRepo, eosRepo }).then(async (result) => {
      const {
        duplicatedEOSicon,
        duplicatedMDicon,
        duplicatedIconsList
      } = result

      if (duplicatedEOSicon.length) {
        console.log(duplicatedEOSicon)

        for await (const icon of duplicatedEOSicon) {
          console.log(
            `⚠️ An icon with the name ${icon}.svg already exits in svg/material. Please rename this new icon below:`
          )
          await renameSvgTo(icon, eosRepo, mdRepo).then(done)
        }
      } else if (duplicatedMDicon.length) {
        for await (const icon of duplicatedMDicon) {
          console.log(
            `⚠️ An icon with the name ${icon}.svg already exits svg/. Please rename this new icon below:`
          )
          await renameSvgTo(icon, mdRepo, eosRepo).then(done)
        }
      } else if (duplicatedIconsList.length) {
        for await (const icon of duplicatedIconsList) {
          console.log(`${icon}`)
          await deleteDuplicateSvg(icon).then()
        }
        done()
      } else {
        console.log('✅  No duplicated SVG file found in EOS and MD folder.')
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
            await downloadMDFile(iconList).then()
            done()
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

  grunt.registerTask('jsFromJSON', async function () {
    const done = this.async()

    jsFileFromJSON().then(done)
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
            await renameSvgTo(icon, eosDir, mdDir)
          }
          process.exit(1)
        }

        if (mdIconsMdNew.length) {
          for await (const icon of mdIconsMdNew) {
            console.log(
              `⚠️  ${icon}.svg is not matching our naming convention, please rename it below:`
            )
            await renameSvgTo(icon, mdDir, eosDir).then(done)
          }
        }
      } else {
        console.log('✅  All SVGs have correct naming convention.')
        done()
      }
    })
  })

  grunt.loadNpmTasks('grunt-webfont')
  grunt.loadNpmTasks('grunt-svgmin')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-text-replace')

  grunt.registerTask('cleanSvg', ['svgmin'])
  grunt.registerTask('clean:all', [
    'clean:hidden',
    'clean:dist',
    'clean:icons',
    'clean:models',
    'clean:tempFolder'
  ])
  grunt.registerTask('build', [
    'findDuplicateNames',
    'clean:all',
    'concat',
    'copy:outlined',
    'temp_svg_collection',
    'webfont:icons',
    'webfont:outlined',
    'replace',
    'combineAllIconsModels',
    'clean:tempFolder',
    'jsFromJSON',
    'copy:newIcons'
  ])
  grunt.registerTask('test', [
    'importMdIcons',
    'findDuplicateNames',
    'checkNameConvention',
    'checkModelKeysTask',
    'checkMissingModelandSVG',
    'materialOutlineModels',
    'eosIconsOutlineModels',
    'checkMissingModelsOutlined',
    'cleanSvg'
  ])
  grunt.registerTask('default', ['test', 'build'])
}
