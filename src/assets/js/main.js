import $ from 'jquery'
import jQueryBridget from 'jquery-bridget'
import Masonry from 'masonry-layout'

jQueryBridget('masonry', Masonry, $)

$('#main > .container > .row ').masonry({
  itemSelector: '.post',
  columnWidth: '.post'
})
