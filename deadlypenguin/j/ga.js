/*jslint browser: true, regexp: true, nomen: true */
/*global jQuery, $ */

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-10566743-5']);
_gaq.push(['_trackPageview']);

(function () {
	'use strict';
	var ga, s;
	ga = document.createElement('script');
	ga.type = 'text/javascript';
	ga.async = true;
	ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(ga, s);
}());