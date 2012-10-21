#!/usr/bin/perl
#
# by pcon
#
# usage   /package version channel package
# example /package 4 base glibc

# Channels Avaliable
# ------------------
# RHEL 3: base, extras, cluster
# RHEL 4: base, extras, cluster, rhaps-2
# RHEL 5: base, supplimentary, cluster, cluster-storage, vt, appstk-2

use strict;
use IO::Socket;
use LWP::Simple;

use vars qw($VERSION %IRSSI);

use Irssi qw(command_bind active_win);
$VERSION = '1.0';
%IRSSI = (
    authors	=> 'pcon',
    contact	=> 'patrick@deadlypenguin.com',
    name	=> 'package',
    description	=> 'find the most recent version of a package on rhn',
    license	=> 'GPL',
);

command_bind(
    package => sub {
      my ($msg, $server, $witem) = @_;
      my $answer = package_print($msg);
      if ($answer) {
        print CLIENTCRAP "$answer";
      }
    }
);

sub package_print ($) {
	my ($version, $child, $pkg) = split " ", $_[0];

	my $fname;

	if ($version == 5) {
		if ($child ne "appstk-2") {
			$fname = "rhel-".$child."-5";
			$fname =~ s/-base//;
		} else {
			$fname = "rhel-5-appstk-2";
		}
	} else {
		$fname = "rhel-".$version."-".$child;
		$fname =~ s/-base//;
	}

	my $url='http://morbo.rdu.redhat.com/pub/packages/'.$fname;
	return get_package($url,$pkg);
}

sub get_package($$) {
	my ($url, $pkg) = @_;
	my $res = get $url;
	$res =~ /(^$pkg.*$)/m;

	return $1;
}
