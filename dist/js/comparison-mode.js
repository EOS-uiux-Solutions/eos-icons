;(function () {

  window
    fetch('../js/glyph-list.json')
          .then(res => res.json())
          .then(data => {
            console.log(data)
          })
          .catch(err => console.error(err));

})()
