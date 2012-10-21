#!/usr/bin/perl
#
# by pcon

use strict;
use IO::Socket;
use JSON;
use LWP::UserAgent;

use vars qw($VERSION %IRSSI);

use Irssi qw(command_bind active_win);
$VERSION = '1.0';
%IRSSI = (
    authors	=> 'pcon',
    contact	=> 'patrick@deadlypenguin.com',
    name	=> 'mpd',
    description	=> 'Gets the current song from an mpd-rest server',
    license	=> 'GPL',
);

Irssi::settings_add_str('mpd', 'mpd_server', 'mpd.example.com');
Irssi::settings_add_str('mpd', 'display_string', 'is listening to [TITLE] by [ARTIST] on [ALBUM] ♫♪');

command_bind(
mpd => sub {
	my ($msg, $server, $witem) = @_;
		my $answer = fullurl($msg);
		if ($answer) {
			print CLIENTCRAP "$answer";
		}
	}
);

sub fullurl {
	my $full = shift;
	my $ua = LWP::UserAgent->new;
	$ua->agent("fullurl for irssi/1.0 ");

	my $req = HTTP::Request->new;
	$req->content_type('application/json');
	my $MPD_SERVER = Irssi::settings_get_str('mpd_server');
	my $url = 'http://'.$MPD_SERVER.'/mpd/status/currentsong/';
	my $result = $ua->get($url);

	if ($result->is_success) {
		active_win()->command("ME ".get_current_track($result->content));
	} else {
		print CLIENTCRAP "ERROR: MPD client unavailable  (".$result->code().")";
		return "";
	}
}

sub get_current_track($) {
	my $content = shift;
	my $json = new JSON;
	my $json_text = $json->allow_nonref->utf8->relaxed->decode($content);

	my $s = Irssi::settings_get_str('display_string');
	$s =~ s/\[TITLE\]/$json_text->{title}/g;
	$s =~ s/\[ARTIST\]/$json_text->{artist}/g;
	$s =~ s/\[ALBUM\]/$json_text->{album}/g;

	return $s;
}
