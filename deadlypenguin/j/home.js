/*jslint browser: true, regexp: true */
/*global jQuery */

jQuery(document).ready(function () {
	'use strict';

	var docWidth, carouselWidth;
	
	docWidth = jQuery(window).width();
	carouselWidth = jQuery('#carousel').width();

	if (docWidth - 40 < carouselWidth) {
		carouselWidth = docWidth - 40;
	}

	jQuery('.carousel').width(carouselWidth).carousel();

});