var urlMap = new Array();
urlMap['who'] = '#who_img';
urlMap['sponsors'] = '#sponsors_img';
urlMap['schedule'] = '#schedule_img';
urlMap['where'] = '#where_img';
urlMap['join'] = '#join_img';
urlMap['about'] = '#about_img';

var mobileSheet = '<link rel="stylesheet" type="text/css" href="/s/mobile.css" media="screen" />';

function setCurrentPage() {
	var href = $(location).attr('pathname');
	href = href.replace(new RegExp('^/'),'');
	href = href.replace(new RegExp('/$'),'');

	if (href in urlMap) {
		var img = jQuery(urlMap[href]);
		var imgSrc = img.attr('src').replace('\.png', '_selected\.png');
		img.attr('src', imgSrc);
	} else if (href === '') {
		var img = jQuery('#home_img');
		var imgSrc = img.attr('src').replace('\.png', '_selected\.png');
		img.attr('src', imgSrc);
	}
}

function addMobileSheet() {
	if (jQuery.browser.mobile) {
		jQuery('head').append(mobileSheet);
	}
}

$(document).ready(function() {
	setCurrentPage();
	addMobileSheet();
});