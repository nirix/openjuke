OpenJuke
========

OpenJuke is an open-source juke box intended to primarily run on a unix-like system.

Requirements and Setup
----------------------

### Requirements

- Ruby 2.0 or newer
- taglib
- A database, such as MySQL but SQLite works too.
- A browser that supports the `<audio>` HTML tag and audio codecs for your music.
- Music

### Setup

Once you have Ruby and your database setup, you will need to rename the `config.yml.new` to
just `config.yml` and edit it with the database URL and the port number for the jukebox server
to run on (for example: `http://localhost:3000`).

1.  You will need to install the required gems, which will require Bundler:

        $ gem install bundler
        $ bundle install

2.  Import the `openjuke.sql` into the database.

3.  You will then need to either place your music in, or symlink your music directory to `public/tracks`
    and index them like so:

        $ ln -s $HOME/music public/tracks
        $ bin/index_tracks

4. All that's left to do is start the server and enjoy:

        $ bundle exec thin start

License
-------

OpenJuke is released under the BSD 3-clause licence.
