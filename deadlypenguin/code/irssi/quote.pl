#!/usr/bin/perl

# quote.pl

# script for storing, retreiving quotes

use vars qw($VERSION %IRSSI);
use Irssi qw(command_bind signal_add active_win get_irssi_dir);
use strict;
use Date::Formatter;
use Tie::File;

$VERSION = '0.5';
%IRSSI   = (
	author      => 'Adam Stokes',
	contact     => 'astokes@redhat.com',
	name        => 'quotes',
	description => 'Store/print quotes from file',
	license     => 'GPL',
);

# Colors
my @mirc_color_arr = ("\0031","\0035","\0033","\0037","\0032","\0036",
						"\00310","\0030","\00314","\0034","\0039","\0038",
						"\00312","\00313","\00311","\00315","\017");

sub print_msg {
	active_win()->print("@_");
}

sub print_chan {
	my ( $cmd_line, $server, $witem ) = @_;
	my @args = split( ' ', $cmd_line );

	if ( @args <= 0 ) {
		print_msg "Usage:";
		print_msg "/qsay nick <nick>    Print random quote for nick";
		print_msg "/qsay rand           Print random quote";
		print_msg "/qadd nick: <quote>  Add quote to db";
		print_msg "/qdel <quote>        Delete quote";
	}

	my $action = lc( shift(@args) );

	if ( $action eq "rand" ) {
		random_quote();
	}
	elsif ( $action eq "nick" ) {
		my $nick = lc( shift(@args) );
		rand_nick($nick);
	}
	return 0;
}

sub random_quote {
	my ($file) = get_irssi_dir."/quote.db";
	tie my @quotes, "Tie::File", $file, autochomp => 1;
	my $element = $quotes[ rand @quotes ];
	my ( $nick, $qline, $date ) = split( /:::/, $element );
	active_win()->command("SAY $mirc_color_arr[8] [QDB]".
							"$mirc_color_arr[11] \"$qline\"".
							"$mirc_color_arr[12] --".
							"$mirc_color_arr[14] $nick,".
							"$mirc_color_arr[8] $date");
	return 0;
}

sub rand_nick {
	my ($nick) = @_;
	my ($file) = get_irssi_dir."/quote.db";
	tie my @quotes, "Tie::File", $file, autochomp => 1;
	my @f_quotes;
	@f_quotes = grep { /$nick/ } @quotes;
	my $element = $f_quotes[ rand @f_quotes ];
	if (length($element)) {
		my ( $nick, $qline, $date ) = split( /:::/, $element );
		active_win->command("SAY $mirc_color_arr[8] [QDB]".
							"$mirc_color_arr[11] \"$qline\"".
							"$mirc_color_arr[12] --".
							"$mirc_color_arr[14] $nick,".
							"$mirc_color_arr[8] $date");
	}
	else {
		print_msg "[QDB] Error: No quotes found for $nick";
	}
	untie @quotes;
	return 0;
}

sub add_quote {
	my ($file) = get_irssi_dir."/quote.db";
	my ($date) = Date::Formatter->now();
	$date->createDateFormatter("(hh):(mm):(ss) (T) (MM)/(DD)/(YYYY)");
	my ( $quote, $server, $witem ) = @_;
	if ( $quote =~ m/\s*(\w+):\s(.*)$/osi ) {
		my $nick  = $1;
		my $qline = $2;
		active_win->command("SAY $mirc_color_arr[8] [QDB Stored]".
							"$mirc_color_arr[11] \"$qline\"".
							"$mirc_color_arr[12] --".
							"$mirc_color_arr[14] $nick,".
							"$mirc_color_arr[8] $date");
		my $rec = join( ':::', $nick, $qline, $date );
		tie my @quotes, "Tie::File", $file;
		push @quotes, $rec ."\n";
		untie @quotes;
	}
	else {
		print_msg "[QDB] Error: must supply in form of nick: <quote>";
	}
	return 0;
}

sub del_quote {
	my ($qline) = @_;
	my ($file) = get_irssi_dir."/quote.db";
	tie my @quotes, "Tie::File", $file, autochomp => 0;
	@quotes = grep { !/$qline/ } @quotes;
	untie @quotes;
	return 0;
}

command_bind( 'qsay', 'print_chan' );
command_bind( 'qadd', 'add_quote' );
command_bind( 'qdel', 'del_quote' );

