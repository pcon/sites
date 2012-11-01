function getParam(name) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\#&\?]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );

	if( results == null ) {
		return "";
	} else {
		return results[1];
	}
}

function urlExists(url) {
	var http = null;

	if (window.XMLHttpRequest) {
		http = new XMLHttpRequest();
	} else {
		http = new ActiveXObject("Microsoft.XMLHTTP");
	}

	if (http == null) {
		return false;
	}

	http.open('HEAD', url, false);
	http.send(null);
	return http.status!=404;
}


var rootDir = "";
var galleryXML = "";

$(document).ready(function() {
	Galleria.loadTheme('/galleria/themes/classic/galleria.classic.min.js');
	rootDir = getParam("rootDir");

	if (rootDir == "") {
		rootDir = window.location.pathname.replace('gallery2', 'gallery');
	}

	var galleryJSON = null;
	var parts = rootDir.split('/');

	galleryJSON = 'http://' + parts[1] + '.deadlypenguin.com/'
	first=true;
	for (i = 2; i < parts.length; i++) {
		if (!first && parts[i] != "") {
			galleryJSON = galleryJSON + '-';
		}
		first = false;
		galleryJSON = galleryJSON + parts[i];
	}

	var request = jQuery.ajax({
		url: galleryJSON,
		success: parseCloudantFeed,
		dataType: 'jsonp',
	});
});

function showBadGallery(jqXHR, textStatus) {
	jQuery.getJSON('http://www.deadlypenguin.com/json/static.json', function(data) {
		var badPenguinImage = data.badPenguinImage;
		jQuery('#galleria').css('text-align', 'center');
		jQuery('#galleria').append('<img src="'+badPenguinImage+'" alt="404" title="404" width=350 height=350/><p>The gallery you have requested can not be found.');
	});
}

function showGallery(dataset) {
	// run galleria and add some options
	
	var startItem = Number(getParam('photo'));

	$('#gallery').galleria({
		image_crop: false,
		transition: 'fade',
		height: 500,
		responsive: false,
		preload: 6,
		transition: 'slide',
		show: startItem,
		data_source: dataset,
		extend:function() {
			this.attachKeyboard({
				left: this.prev,
				right: this.next,
			});
		}
	});
}

function parsePicasaJSON(data, status) {
	var dataset = new Array();
	
	$.each(data.feed.entry, function(i, item) {
		var image = item.content.src;
		var thumb = item.media$group.media$thumbnail[1].url;
		var desc = item.title.$t;
		var pattern = /\.jpg$/i
		if (desc.match(pattern)) {
			desc = "";
		}

		dataset.push({image: image, thumb: thumb, description: ""+desc});
	});

	showGallery(dataset);
}

function parseCloudantFeed(data, status) {
	jQuery.ajax({url: data.url, success: parsePicasaJSON, dataType: 'jsonp'});

	document.title = document.title + ' - ' + data.title;

	var breadcrumbHTML = '';

	jQuery.each(data.breadcrumb, function(i, item) {
		if (breadcrumbHTML != '') {
			breadcrumbHTML = breadcrumbHTML + ' - ';
		}

		breadcrumbHTML = breadcrumbHTML + '<a href="'+item.url+'">'+item.name+'</a>';
	});

	if (breadcrumbHTML != '') {
		jQuery('#breadcrumb').html(breadcrumbHTML);
	}
}
