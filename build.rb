#!/usr/bin/env ruby

require 'r4tw'

$version_number = '2.7.0';

make_tw {
  source_file           'empties/empty.html'
  to_file               'upload/emptyempty.html'
  remove_tiddler        'LegacyStrikeThroughPlugin'
  add_tiddlers_from_dir 'core','*.js'
  add_tiddlers_from_dir 'themes'
  add_tiddlers_from_dir 'palettes'
  store_to_file         'upload/upgrade.html'
  add_tiddlers_from_dir 'noupgrade'
  add_tiddler_from_scratch({
    'tiddler'=>'systemConfig',
    'taggly.excerpts'=>'descr',
    'taggly.sortby'=>'created',
    'taggly.sortorder'=>'desc',
  })
  tiddlers.each { |t| t.fields['modifier'] = 'MPTW' }
  to_file               'upload/empty.html'
}

# Create .meta files
Dir['core/*.js'].each do |plugin_file|
  t = Tiddler.new(plugin_file)
  t.fields['modifier'] = 'MPTW'
  t.to_cook_meta.to_file("#{plugin_file}.meta")
end
puts "Wrote meta files"

