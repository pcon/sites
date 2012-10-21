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
	Galleria.loadTheme('/galleria_new/themes/classic/galleria.classic.js');
    	rootDir = getParam("rootDir");

	if (rootDir == "") {
		rootDir = window.location.pathname.replace('gallery2', 'gallery');
	}

	var galleryJSON = null;
	var parts = rootDir.split('/');


	if (parts[1] == 'gallery') {
		if (parts[2] == 'people') {
			galleryJSON = '/json/' + parts[2] + '/';
			first=true;
			for (i = 3; i < parts.length - 1; i++) {
				if (!first) {
					galleryJSON = galleryJSON + '-';
				}
				first = false;
				galleryJSON = galleryJSON + parts[i];
			}
			galleryJSON = galleryJSON + '.json';
		} else if (parts[2] == 'places') {
			galleryJSON = '/json/' + parts[2] + '/' + parts[3];
			for (i = 4; i < parts.length - 1; i++) {
				galleryJSON = galleryJSON + '-' + parts[i];
			}
			galleryJSON = galleryJSON + '.json';
		}
	} else {
		if (parts[1] == 'people' || parts[1] == 'residential' || parts[1] == 'events') {
			galleryJSON = '/json/' + parts[1] + '/';
               first=true;
               for (i = 2; i < parts.length-1; i++) {
                    if (!first) {
                         galleryJSON = galleryJSON + '-';
                    }
                    first = false;
                    galleryJSON = galleryJSON + parts[i];
               }
               galleryJSON = galleryJSON + '.json';
		} else if (parts[1] == 'places') {
			galleryJSON = '/json/' + parts[1] + '/' + parts[2];
			for (i = 3; i < parts.length - 1; i++) {
				galleryJSON = galleryJSON + '-' + parts[i];
			}
			galleryJSON = galleryJSON + '.json';
		}
	}

	galleryXML = rootDir+'/gallery.xml';
	xmlHttp = null

	if (galleryJSON != null && urlExists(galleryJSON)) {

		if (window.XMLHttpRequest) {
			xmlHttp = new XMLHttpRequest();
		} else {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		if (xmlHttp != null) {
		     xmlHttp.onreadystatechange = parseJSONFeed;
			xmlHttp.open( "GET", galleryJSON, true );
		     xmlHttp.send( null );
		}
	} else if (urlExists(galleryXML)) {
		if (window.XMLHttpRequest) {
			xmlHttp = new XMLHttpRequest();
		} else {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}

		if (xmlHttp != null) {
			xmlHttp.onreadystatechange = parseXMLFeed;
			xmlHttp.open( "GET", galleryXML, true );
		     xmlHttp.send( null );
		}
	} else {
		jQuery.getJSON('http://www.deadlypenguin.com/json/static.json', function(data) {
			var badPenguinImage = data.badPenguinImage;
			jQuery('#galleria').css('text-align', 'center');
			jQuery('#galleria').append('<img src="'+badPenguinImage+'" alt="404" title="404" width=350 height=350/><p>The gallery you have requested can not be found.');
		});
	}

});

function showGallery(dataset) {
	// run galleria and add some options
	
	var startItem = Number(getParam('photo'));

	$('#galleria').galleria({
		image_crop: false,
		transition: 'fade',
		height: 500,
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

function parseFlickrJSON(data, status) {
	var dataset = new Array();
	
	$.each(data.photoset.photo, function(i, item) {
		var image = item.url_m;
		var desc = item.title;
		var pattern = /\.jpg$/i
		if (desc.match(pattern)) {
			desc = "";
		}

		dataset.push({image: image, description: ""+desc});
	});

	showGallery(dataset);
}

function parsePicasaJSON(data, status) {
	var dataset = new Array();
	
	$.each(data.feed.entry, function(i, item) {
		var image = item.content.src;
		var desc = item.title.$t;
		var pattern = /\.jpg$/i
		if (desc.match(pattern)) {
			desc = "";
		}

		dataset.push({image: image, description: ""+desc});
	});

	showGallery(dataset);
}

function parseJSONFeed() {
	if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
		var data = jQuery.parseJSON(xmlHttp.responseText);
		if (data.type == 'json') {
			if (data.source == 'flickr') {
				$.ajax({url: data.url, success: parseFlickrJSON, dataType: 'jsonp'});
			} else {
				$.ajax({url: data.url, success: parsePicasaJSON, dataType: 'jsonp'});
			}
		}

		document.title = document.title + ' - ' + data.title;

		var breadcrumbHTML = '';

		$.each(data.breadcrumb, function(i, item) {
			if (breadcrumbHTML != '') {
				breadcrumbHTML = breadcrumbHTML + ' - ';
			}

			breadcrumbHTML = breadcrumbHTML + '<a href="'+item.url+'">'+item.name+'</a>';
		});

		if (breadcrumbHTML != '') {
			jQuery('#breadcrumb').html(breadcrumbHTML);
		}
	} 
}

function parseXMLFeed() {
	if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
          var data = xmlHttp.responseText;
          if (data != "") {
               var xmlobject = (new DOMParser()).parseFromString(data, "text/xml");
               var root = xmlobject.getElementsByTagName('simpleviewerGallery')[0];
			var type = null;
			var remoteUrl = null;
			var breadcrumb = null;
			var breadcrumbHTML = '';

			try {
				type = root.getElementsByTagName("type")[0].childNodes[0].nodeValue;
				remoteUrl = root.getElementsByTagName("url")[0].childNodes[0].nodeValue;
				title = root.getElementsByTagName("title")[0].childNodes[0].nodeValue;
				
				document.title = document.title + ' - ' + title;

				$.ajax({url: remoteUrl, success: parseJSON, dataType: 'jsonp'});
				
				breadcrumb = root.getElementsByTagName("breadcrumb")[0];
				var i = 0;
				while(i < 5) {
					var name = breadcrumb.attributes.getNamedItem("name").value;
					var url = breadcrumb.attributes.getNamedItem("url").value;
					if (breadcrumbHTML != '') {
						breadcrumbHTML = breadcrumbHTML + ' - ';
					}

					breadcrumbHTML = breadcrumbHTML + '<a href="'+url+'">'+name+'</a>';

					breadcrumb = breadcrumb.getElementsByTagName("breadcrumb")[0];
				}
			} catch(err) {
				if (breadcrumbHTML != '') {
					jQuery('#breadcrumb').html(breadcrumbHTML);
				}
			}
			
			if (type == null || remoteUrl == null) {
				var dataset = new Array();
				var items = root.getElementsByTagName("image");

				for (var i=0; i < items.length; i++) {
					var image = "";
					try {
						image = items[i].getElementsByTagName("url")[0].childNodes[0].nodeValue;
					} catch (err) {
						if (image == "") {
							image = rootDir + "/images/" + items[i].getElementsByTagName("filename")[0].childNodes[0].nodeValue;
						}
					}

					var desc;
					try {
						desc = items[i].getElementsByTagName("caption")[0].childNodes[0].nodeValue;
					} catch(err) {
						desc = "";
					}

					dataset.push({image: image, description: ""+desc});
				}

				showGallery(dataset);
			}
		}
	}
}
