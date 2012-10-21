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
    name	=> 'fullurl',
    description	=> 'create a fullrul from a tinyurl',
    license	=> 'GPL',
);

command_bind(
    fullurl => sub {
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
  my $req = HTTP::Request->new(POST => 'http://tinyurl.com/preview.php');
  $req->content_type('application/x-www-form-urlencoded');
   $full =~ m/(.*)tinyurl\.com\/(.*)/;
   my $url = $2;
  $req->content("num=$url");
  my $res = $ua->request($req);

  if ($res->is_success) {
	  return get_full_url($res->content);
  } else {
    print CLIENTCRAP "ERROR: tinyurl: tinyurl is down or not pingable";
		return "";
	}
}

sub get_full_url($) {
	
	my $tiny_url_body = shift;
	$tiny_url_body =~ /(.*)(redirecturl\"\shref=\")(.*)(\")(.*)/;

	return $3;
}
