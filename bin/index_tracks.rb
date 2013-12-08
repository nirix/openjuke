require 'taglib'
require 'sequel'
require 'yaml'

# Configuration
config = YAML.load_file('./config.yml')
DB = Sequel.connect(config['database'])

# Tracks model
class Track < Sequel::Model; end

# Index track function
def index_track(info)
  track = Track.new info
  track.save
end

# Directory scanner
puts "Indexing"

extensions = %w[mp3 mp4 m4a flac wav].join ','
Dir.chdir('public/tracks')
Dir.glob("**/*.{#{extensions}}") do |f|
  # if !Track.where(location: f).count
    TagLib::FileRef.open(f) do |ref|
      unless ref.null?
        tag = ref.tag
        info = {
          artist: tag.artist,
          name:   tag.title,
          album:  tag.album,
          location: f
        }

        if Track.where(location: f).or(artist: tag.artist, name: tag.title).count == 0
          index_track info
        end
      end
    end
  # end
end

puts "Done"
