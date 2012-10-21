#!/usr/bin/perl
#
# Chris Van Hoof <vanhoof@redhat.com> 
#   Simple Irssi script to update your Twitter status.
#   Be sure to set TWITTER_{USER,PASS} in your shell before use.
#
#   Usage: /tw update <input>
#

use strict;
use vars qw($VERSION %IRSSI);
use Irssi qw(command_bind active_win);
use Net::Twitter;

$VERSION = '1.23';
%IRSSI = (
    author      => 'Chris Van Hoof',
    contact     => 'vanhoof@redhat.com',
    name        => 'TwittIrssi',
    description => 'Update Twitter from Irssi',
    license     => 'GPL'
);

# Set these two if not using TWITTER_USER and TWITTER_PASS environment variables 
my $twitter_user = 'aelst';
my $twitter_pass = 'troop10';

$twitter_user = $ENV{'TWITTER_USER'} if $ENV{'TWITTER_USER'};
$twitter_pass = $ENV{'TWITTER_PASS'} if $ENV{'TWITTER_PASS'};

if ((! $twitter_user) && (! $twitter_pass)) {
    print_message_in_irssi("twitter_user and twitter_pass variables have not been set.");
    print_message_in_irssi("Either hard set them in TwittIrssi.pl, or use TWITTER_USER and TWITTER_PASS environment variables.");
    die;
}

print_message_in_irssi("Usage: /tw update <input>");        


sub parse_user_input {
    my ($command_line, $server, $witem) = @_;
    my @user_input = split(' ', $command_line);

    if (@user_input <= 0) {
        print_message_in_irssi("Usage: /tw update <input>");
    }

    my $action = lc(shift(@user_input));

    if ($action eq "update") {
        my $twitter_update = join(' ', @user_input);
        update_twitter_status($twitter_update);
    }
    
    return 0;
}

sub update_twitter_status {
    my $twitter_update = shift;
    my $twit = Net::Twitter->new(
                source => 'twittirssi',
                username => $twitter_user, 
                password => $twitter_pass 
            );
                
    my $result = $twit->update($twitter_update);

    if ($result) {
        print_message_in_irssi("Your Twitter status has been updated");
        return 1;
    } else {
        print_message_in_irssi("Something went wrong while updating your Twitter status");
        print_message_in_irssi("The error received was: ".$twit->http_code." - ".$twit->http_message);
        return 0;
    }
}

sub print_message_in_irssi {
    active_win()->print(@_);
}

command_bind('tw', 'parse_user_input');
