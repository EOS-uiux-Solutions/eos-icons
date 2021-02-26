;(function () {
  // Fetchs the Gitlab API for the latest release tag
  window
    .fetch('https://gitlab.com/api/v4/projects/4600360/repository/tags')
    .then((response) => response.json())
    .then((tags) => {
      try {
        const tagRelease = new Date(tags[0].commit.committed_date)
        // Condition to check for date for both normal and outlined svgs
        const isOutlined = document.getElementById('eos-icons-preview')
          ? 'date'
          : 'dateOutlined'

        // Filter out the icons that are newer than the latest release tag.
        // eslint-disable-next-line no-undef
        const newIconsList = eosIcons.filter((ele) => {
          if (!ele[isOutlined]) return
          const date = ele[isOutlined].split('/')
          const itemDate = new Date(
            date[2],
            date[1],
            date[0]
          ).toLocaleDateString()

          if (itemDate < tagRelease.toLocaleDateString()) return ele
        })

        // Removes the preview wrap if no new icons are found
        if (newIconsList.length === 0)
          return document.querySelector('.latest').remove()

        const target = document.querySelector('.latest-icons')
        // Appends each icon to the preview wrap
        newIconsList.forEach((ele) => {
          const div = document.createElement('div')

          div.classList.add('icons__item')
          div.setAttribute('name', ele.name)
          div.innerHTML = `
                    <i class="eos-icons">
                      ${ele.name}
                    </i>
                    <br>
                    ${ele.name}`

          target.append(div)
        })
      } catch (error) {
        console.log(error)
      }
    })
})()
