#!/usr/bin/perl
#
# by pcon

use strict;
use IO::Socket;
use LWP::UserAgent;

use vars qw($VERSION %IRSSI);

use Irssi qw(command_bind active_win);
$VERSION = '1.0';
%IRSSI = (
    authors	=> 'pcon',
    contact	=> 'patrick@deadlypenguin.com',
    name	=> 'hurl',
    description	=> 'Takes a full url and makes it smaller with hURL',
    license	=> 'GPL',
);

command_bind(
	hurl => sub {
		my ($msg, $server, $witem) = @_;
		my $answer = hurl($msg);
		if ($answer) {
			active_win->command("SAY $answer");
		}
	}
);

sub hurl {
	my $url = shift;

	if ($url) {
		my $ua = LWP::UserAgent->new;
		$ua->agent("fullurl for irssi/1.0 ");
		my $req = HTTP::Request->new(GET => 'http://hurl.test.redhat.com/new?'.$url);
		$req->content_type('application/x-www-form-urlencoded');
		my $res = $ua->request($req);

		if ($res->is_success) {
			return get_small_url($res->content);
		} else {
			print CLIENTCRAP "ERROR: hurl: hurl host is down or not pingable";
			return "";
		}
	} else {
		print CLIENTCRAP "USAGE: /hurl http://longurltoshorten.com";
	}
}

sub get_small_url($) {
	my $body = shift;
	return $body;
}
