function loggly(data) {
	var key = '11996c63-1738-422f-bcc2-7271e9411260'
	var url = 'http://logs.loggly.com/inputs/'+key+'.gif';
	var params = '?';

	for (var key in data) {
		params += key+"="+encodeURIComponent(data[key])+"&";
	}

	var full_url = url + params.substr(0, params.length-1);

	jQuery('body').append('<img src="'+full_url+'" />');
}

// fn to handle jsonp with timeouts and errors
// hat tip to Ricardo Tomasi for the timeout logic
$.getJSONP = function(s) {
	s.dataType = 'jsonp';
	$.ajax(s);

	// figure out what the callback fn is
	var $script = $(document.getElementsByTagName('head')[0].firstChild);
	var url = $script.attr('src') || '';
	var cb = (url.match(/callback=(\w+)/)||[])[1];
	if (!cb)
		return; // bail
	var t = 0, cbFn = window[cb];

	$script[0].onerror = function(e) {
		$script.remove();
		handleError(s, {}, "error", e);
		clearTimeout(t);
	};

	if (!s.timeout)
		return;

	window[cb] = function(json) {
		clearTimeout(t);
		cbFn(json);
		cbFn = null;
	};

	t = setTimeout(function() {
		$script.remove();
		handleError(s, {}, "timeout");
		if (cbFn)
			window[cb] = function(){};
	}, s.timeout);
	
	function handleError(s, o, msg, e) {
		showBadGallery(e,msg);

		loggly({
			url:window.location.href,
			galleryUrl: s.url,
			previousPage: document.referrer,
			StatusCode: 404
		});
	}
};

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

	var request = jQuery.getJSONP({
		url: galleryJSON,
		success: parseCloudantFeed,
		dataType: 'jsonp',
	});
});

function showBadGallery(jqXHR, textStatus) {
	jQuery.getJSONP({
		url: 'http://db.deadlypenguin.com/static/root',
		dataType: 'jsonp',
		success: function(data) {
			var badPenguinImage = data.data.badPenguinImage;
			jQuery('#gallery').css('text-align', 'center');
			jQuery('#gallery').append('<img src="'+badPenguinImage+'" alt="404" title="404" width=350 height=350/><p>The gallery you have requested can not be found.');
		}
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