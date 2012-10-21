/*jslint nomen: true*/
/*global document, window, jQuery*/
/*jslint nomen: false*/

jQuery.noConflict();
jQuery(document).ready(function () {
	"use strict";
	var numCovers, coverNumber;

	numCovers = 4;
	coverNumber = Math.floor(Math.random() * numCovers) + 1;
	jQuery('#coverImage' + coverNumber).removeClass('hidden');
});
