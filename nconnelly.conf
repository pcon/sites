<VirtualHost *:80>
	ServerAdmin webmaster@deadlypenguin.com
	DocumentRoot /var/www/nconnelly
	ServerName nconnelly.com
	ServerAlias www.nconnelly.com
	ErrorLog logs/nconnelly.com-error_log
	CustomLog logs/nconnelly.com-access_log common

	Alias /demoreel/ "/var/www/nconnelly/demoreel.html"
     Alias /demoreel "/var/www/nconnelly/demoreel.html"

	# Feed rewrites
	RewriteEngine On
	RewriteLog "/var/log/httpd/test.nconnelly.com-rewrite_log"
	RewriteLogLevel 0

	RewriteRule ^/portfolio/art(/)? /portfolio/gallery.php?title=Art&setId=72157627480048957&nsId=67193232@N07 [P,L]
	RewriteRule ^/portfolio/animationDesign(/)? /portfolio/gallery.php?title=Animation\%20Design&setId=72157627479980477&nsId=67193232@N07 [P,L]
	RewriteRule ^/portfolio/photography(/)? /portfolio/gallery.php?title=Photography&setId=72157626764934472&nsId=16940850@N02 [P,L]

	# Portfolio rewrites
	Alias /portfolio/storyboard/crusaders/ "/var/www/nconnelly/portfolio/storyboard-crusaders.html"
	Alias /portfolio/storyboard/crusaders "/var/www/nconnelly/portfolio/storyboard-crusaders.html"
	Alias /portfolio/storyboard/adventureTime/ "/var/www/nconnelly/portfolio/storyboard-adventureTime.html"
	Alias /portfolio/storyboard/adventureTime "/var/www/nconnelly/portfolio/storyboard-adventureTime.html"
	Alias /portfolio/storyboard/blueSky/ "/var/www/nconnelly/portfolio/storyboard-blueSkyStoryTest.html"
	Alias /portfolio/storyboard/blueSky "/var/www/nconnelly/portfolio/storyboard-blueSkyStoryTest.html"
	Alias /portfolio/storyboard/ "/var/www/nconnelly/portfolio/storyboard.html"
	Alias /portfolio/storyboard "/var/www/nconnelly/portfolio/storyboard.html"

	# Comic rewrites
	Alias /comics/kidMinotaur/1/ "/var/www/nconnelly/comics/comic-kidminotaur-1.html"
	Alias /comics/kidMinotaur/1 "/var/www/nconnelly/comics/comic-kidminotaur-1.html"
</VirtualHost>

<VirtualHost *:80>
	ServerAdmin webmaster@deadlypenguin.com
	DocumentRoot /var/www/nconnelly-test
	ServerName test.nconnelly.com
	ErrorLog logs/test.nconnelly.com-error_log
	CustomLog logs/test.nconnelly.com-access_log common

	Alias /demoreel/ "/var/www/nconnelly-test/demoreel.html"
     Alias /demoreel "/var/www/nconnelly-test/demoreel.html"

	# Feed rewrites
	RewriteEngine On
	RewriteLog "/var/log/httpd/test.nconnelly.com-rewrite_log"
	RewriteLogLevel 3

	RewriteRule ^/portfolio/art(/)? /portfolio/gallery.php?title=Art&setId=72157627480048957&nsId=67193232@N07 [P,L]
	RewriteRule ^/portfolio/animationDesign(/)? /portfolio/gallery.php?title=Animation\%20Design&setId=72157627479980477&nsId=67193232@N07 [P,L]
	RewriteRule ^/portfolio/photography(/)? /portfolio/gallery.php?title=Photography&setId=72157626764934472&nsId=16940850@N02 [P,L]

	# Portfolio rewrites
	Alias /portfolio/storyboard/crusaders/ "/var/www/nconnelly-test/portfolio/storyboard-crusaders.html"
	Alias /portfolio/storyboard/crusaders "/var/www/nconnelly-test/portfolio/storyboard-crusaders.html"
	Alias /portfolio/storyboard/adventureTime/ "/var/www/nconnelly-test/portfolio/storyboard-adventureTime.html"
	Alias /portfolio/storyboard/adventureTime "/var/www/nconnelly-test/portfolio/storyboard-adventureTime.html"
	Alias /portfolio/storyboard/blueSky/ "/var/www/nconnelly-test/portfolio/storyboard-blueSkyStoryTest.html"
	Alias /portfolio/storyboard/blueSky "/var/www/nconnelly-test/portfolio/storyboard-blueSkyStoryTest.html"
	Alias /portfolio/storyboard/ "/var/www/nconnelly-test/portfolio/storyboard.html"
	Alias /portfolio/storyboard "/var/www/nconnelly-test/portfolio/storyboard.html"

	# Comic rewrites
	Alias /comics/kidMinotaur/1/ "/var/www/nconnelly-test/comics/comic-kidminotaur-1.html"
	Alias /comics/kidMinotaur/1 "/var/www/nconnelly-test/comics/comic-kidminotaur-1.html"
</VirtualHost>