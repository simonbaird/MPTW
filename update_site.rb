
require 'r4tw'

require 'build'

make_tw {
  puts "downloading..."
  source_file            'http://mptw.tiddlyspot.com/'
  puts "updating..."
  copy_all_tiddlers_from 'upload/upgrade.html'
  puts "setting modifier..."
  tiddlers.each { |t| t.fields['modifier'] = 'MPTW' }
  puts "writing..."
  to_file                'upload/index.html'
  puts "done."
}

