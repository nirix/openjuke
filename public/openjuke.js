/*!
 * OpenJuke
 * Copyright (c) 2013, Jack Polgar
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of OpenJuke nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL JACK POLGAR BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// The <audio> element
var $player;

// The progress bar interval variable
var progress_ticker;

// Player status and queued track count
var playing = false;
var queued_tracks = 0;

// Currently playing track info
var current_track;

$(document).ready(function(){
	$player = document.getElementById('audio_player');

	// Hackish rubbish due to 100% CSS height and document height causing the
	// page to scroll as the <audio> player wasn't being taken into account.
	var height = $(window).outerHeight();
	$('#tracks ul').css('max-height', (height - $('#player').outerHeight() - $('#tracks .header').outerHeight()) );
	$('#queued ul').css('height', (height - $('#player').outerHeight() - $('#queued .header').outerHeight()) );

	$("#tracks ul li").each(function(){
		$(this).on('click', function(){
			queueTrack($(this));
		});
	});

	// Track search
	$("#search").on('keyup', function(){
		var query = $("#search").val();
		var tracks = $("#tracks ul li");

		// Hide non matched
		tracks.filter(function(){
			return !RegExp(query, 'i').test($(this).attr('data-title'));
		}).each(function(){
			// $(this).slideUp('fast');
			$(this).hide();
		});

		// Show matches
		tracks.filter(function(){
			return RegExp(query, 'i').test($(this).attr('data-title'));
		}).each(function(){
			// $(this).slideDown('fast');
			$(this).show();
		});
	});

	// Check player status every 500 milliseconds
	window.setInterval(function(){
		// Not playing
		if (!playing) {
			playNextTrack();
		}
		// Playing
		else {
			// Check if audio has ended
			if ($player.ended) {
				playing = false;
				clearInterval(progress_ticker);

				$("#progress_bar .progress").css('width', '0%');
				$('#audio_player').attr('src', '');

				removeCurrentTrack(function(){
					playNextTrack();
				});
			}
		}
	}, 500)
});

/**
 * Updates the progress bar width.
 */
function updateProgress() {
	var track_progress = ($player.currentTime / $player.duration * 100);
	$("#track-" + current_track.id + " .progress_bar .progress").css('width', track_progress + '%');
}

/**
 * Add a track to the queued tracks list.
 *
 * @param object e Element object for the track
 */
function queueTrack(e) {
	queued_tracks++;

	var info = getTrackInfo(e);
	var row  = trackRow(info);
	row.hide();

	$("#queued ul").append(row.fadeIn('fast'));
}

/**
 * Creates the `<li>` element for the given track.
 *
 * @param object track
 */
function trackRow(track) {
	// <li> and track info
	var row = $('<li>');
	row.attr('data-id', track.id);
	row.attr('data-artist', track.artist);
	row.attr('data-name', track.name);
	row.attr('data-location', track.location);
	row.attr('id', "track-" + track.id);

	// Track artist / title
	var track_title = $('<div>').addClass('track_info');
	track_title.append($('<span>').addClass('artist').html(track.artist));
	track_title.append($('<span>').addClass('title').html(track.name));
	row.append(track_title);

	// Track progress bar
	var track_progress = $('<div>').addClass('progress_bar');
	track_progress.append($('<div>').addClass('progress'));
	row.append(track_progress);

	return row;
}

/**
 * Plays the next queued track, if there are no tracks and
 * random selection is enabled, a random track is played.
 */
function playNextTrack() {
	if (queued_tracks > 0) {
		var track = queuedTracks().first();
		var info = getTrackInfo(track);
		playTrack(info);
	} else {
		playing = false;

		if (play_random_track) {
			playRandomTrack();
		}
	}
}

/**
 * Returns the queued tracks.
 *
 * @return array
 */
function queuedTracks() {
	return $("#queued ul li");
}

/**
 * Plays the given track.
 *
 * @param object track
 */
function playTrack(track) {
	if (queued_tracks > 0) {
		queued_tracks--;
	}

	playing = true;
	current_track = track;

	$("#track-" + track.id).addClass('current_track');
	$("#audio_player").attr('src', track.location);

	// $("#now_playing #track_info").fadeOut('fast').html(track.title).fadeIn('fast');
	// $("#now_playing").show();
	// $("#queued .current_track").slideUp('fast');

	$player.play();
	progress_ticker = window.setInterval(updateProgress, 128);
}

/**
 * Removes the currently playing track element.
 *
 * @param function func Function to run after removing the element.
 */
function removeCurrentTrack(func) {
	if (!func) {
		func = function(){};
	}

	$("#track-" + current_track.id).slideUp('fast', function(){
		$(this).remove();
		func();
	});
}

/**
 * Selects a random track from the list and plays it.
 */
function playRandomTrack() {
	var tracks = $("#tracks ul li");
	var random = Math.floor(Math.random() * tracks.length);
	var info = getTrackInfo(jQuery(tracks[random]));
	$("#queued ul").append(trackRow(info).hide().fadeIn('fast'));
	playTrack(info);
}

/**
 * Takes the passed jQuery HTML element and reads the track
 * information from it and returns it as an easy to use object.
 *
 * @param object e
 * @returns object
 */
function getTrackInfo(e) {
	return {
		id:       e.attr('data-id'),
		artist:   e.attr('data-artist'),
		name:     e.attr('data-name'),
		location: e.attr('data-location'),
		title:    e.attr('data-artist') + ' + ' + e.attr('data-name')
	}
}
