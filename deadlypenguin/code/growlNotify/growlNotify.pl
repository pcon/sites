use strict;
use vars qw($VERSION %IRSSI);

use Irssi;
use Net::GrowlClient;
$VERSION = '0.0.2';
%IRSSI = (
	authors     => 'Patrick Connelly',
	contact     => 'patrick@deadlypenguin.com',
	name        => 'growlNotify',
	description => 'Send a growl notification when a hilight occurrs',
	url         => 'http://www.deadlypenguin.com/code/growlNotify/',
	license     => 'GNU General Public License',
	changed     => '$Date: 2009-08-31 12:00:00 +0100 (Mon, 31 Aug 2009) $'
);

Irssi::settings_add_str('growlNotify', 'growl_server', 'growl.example.com');
Irssi::settings_add_str('growlNotify', 'growl_password', 'password');

sub show_help() {
	my $help = $IRSSI{name}." ".$VERSION."
Settings you can change with /SET
	growl_server:		The server to send growl notifications too
	growl_password:	The password to the growl server
";

	print CLIENTCRAP $help;
}

#--------------------------------------------------------------------
# In parts based on fnotify.pl 0.0.4 by Thorsten Leemhuis
# http://www.leemhuis.info/files/fnotify/
# which parts are based on knotify.pl 0.1.1 by Hugo Haas
# http://larve.net/people/hugo/2005/01/knotify.pl
# which is based on osd.pl 0.3.3 by Jeroen Coekaerts, Koenraad Heijlen
# http://www.irssi.org/scripts/scripts/osd.pl
#
# Other parts based on notify.pl from Luke Macken
# http://fedora.feedjack.org/user/918/
#
#--------------------------------------------------------------------

#--------------------------------------------------------------------
# Private message parsing
#--------------------------------------------------------------------

sub priv_msg {
	my ($server,$msg,$nick,$address,$target) = @_;
	my @weekDays = qw(Sun Mon Tue Wed Thu Fri Sat Sun);
	my ($sec,$min,$hour,$mday,$month,$yearoff,$dayofweek,$dayofyear,$daylight) = localtime();
	if ($min < 9) { $min = "0".$min;}
	if ($hour < 9) { $hour = "0".$hour;}
	my $date = "$weekDays[$dayofweek]-$hour:$min";

	my $title = $nick;
	my $message = $date."\n".$msg;
	send_notify($title, $message);
}

#--------------------------------------------------------------------
# Printing hilight's
#--------------------------------------------------------------------

sub hilight {
    my ($dest, $text, $stripped) = @_;
    if ($dest->{level} & MSGLEVEL_HILIGHT) {
	my @weekDays = qw(Sun Mon Tue Wed Thu Fri Sat Sun);
	my ($sec,$min,$hour,$mday,$month,$yearoff,$dayofweek,$dayofyear,$daylight) = localtime();
	if ($min < 9) { $min = "0".$min;}
	if ($hour < 9) { $hour = "0".$hour;}
	my $date = "$weekDays[$dayofweek]-$hour:$min";

	my $title = $dest->{target};
	my $message = $date."\n".$stripped;
	send_notify($title, $message);
    }
}

#--------------------------------------------------------------------
# Send growl
#--------------------------------------------------------------------

sub send_notify {
	my ($title, $message) = @_;

	# The settings_get_str has to go here to catch any changes inside of irssi
	my $GROWL_SERVER = Irssi::settings_get_str('growl_server');
	my $GROWL_PASSWORD = Irssi::settings_get_str('growl_password');

	my $growl;
	eval { $growl = Net::GrowlClient->init(
        'CLIENT_TYPE_REGISTRATION'      => 0, #md5 auth
        'CLIENT_TYPE_NOTIFICATION'      => 1, #md5 auth
        'CLIENT_CRYPT'                  => 0, #Do not crypt 
        'CLIENT_PASSWORD'               => $GROWL_PASSWORD,
        'CLIENT_PEER_HOST'              => $GROWL_SERVER,
        'CLIENT_APPLICATION_NAME'       => 'irssi',
        'CLIENT_NOTIFICATION_LIST'      => ['irssi_hilight', 'irssi_pm'] #The default is the first 'Foo Normal'.
        ); };

	if (defined($growl)) {
		$growl->notify(
			'title'         => "".$title,
			'message'       => "".$message,
			'priority'      => 2,
			'sticky'        => 1
		);
	}
}

#--------------------------------------------------------------------
# Irssi::signal_add_last / Irssi::command_bind
#--------------------------------------------------------------------

Irssi::signal_add_last("message private", "priv_msg");
Irssi::signal_add_last("print text", "hilight");

#- end
