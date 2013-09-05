/*jslint browser: true, regexp: true, nomen: true */
/*global config, QueryString, Galleria, Handlebars, jQuery, $ */

var parsers = {};

function loggly(data) {
	'use strict';
	var key, params, full_url, template;

	params = '';

	for (key in data) {
		if (data.hasOwnProperty(key)) {
			params += key + "=" + encodeURIComponent(data[key]) + "&";
		}
	}

	full_url = config.LOGGLY_GIF_URL + config.URL_PARAM_SEP + params.substr(0, params.length - 1);

	template = Handlebars.compile(config.LOGGLY_GIF_TEMPLATE);
	jQuery('body').append(template({full_url: full_url}));
}

function updateConfigs() {
	'use strict';
	var url_path, url_parts, i, doc_id, template;

	template = Handlebars.compile(config.GALLERY_DOC_TEMPLATE);

	doc_id = '';
	url_path = window.location.pathname.substring(1);
	url_path = url_path.replace(/\/$/, '');
	url_parts = url_path.split('/');

	config.GALLERY_TYPE = url_parts[0];

	for (i = 1; i < url_parts.length; i += 1) {
		doc_id += url_parts[i] + '-';
	}

	config.GALLERY_DOC = doc_id.substr(0, doc_id.length - 1);
	config.DOC_URL = template({type: config.GALLERY_TYPE, doc: config.GALLERY_DOC});
}

function failedGalleryInfo(code, message) {
	'use strict';
	var template, margin, error_message;

	if (message === null || message === undefined) {
		message = config.ERROR_MESSAGE;
	}

	error_message = message;

	if (parseInt(code, 10) === 1) {
		error_message = config.ERROR_MESSAGE;
		code = 404;
	}

	if (code.status !== undefined) {
		error_message = config.ERROR_MESSAGE;
		code = parseInt(code.status, 10);
	}

	margin = (parseInt(jQuery('#gallery').width(), 10) - 350) / 2;
	margin += 'px';

	template = Handlebars.compile(jQuery('#error-template').html());
	jQuery('#gallery').append(template({error_image: config.ERROR_IMAGE, margin: margin, error_message: error_message}));
	jQuery('#gallery').css('text-align', 'center');

	if (jQuery('#breadcrumb li').size() === 0) {
		jQuery('#breadcrumb-container').hide();
	}

	loggly({
		url: window.location.href,
		galleryUrl: config.GALLERY_DOC,
		previousPage: document.referrer,
		StatusCode: code,
		message: message
	});
}

function showGallery(dataset) {
	'use strict';
	var height;

	if (dataset === undefined || dataset.length === 0) {
		failedGalleryInfo(1, 'Gallery empty');
		return;
	}

	height = jQuery(window).height() - jQuery('body').height();

	Galleria.loadTheme('/galleria/themes/deadly/galleria.classic.min.js');
	Galleria.run('#gallery', {
		dataSource: dataset,
		image_crop: false,
		preload: 6,
		transition: 'slide',
		height: height,
		autoplay: 5000,
		extend: function () {
			this.attachKeyboard({
				left: this.prev,
				right: this.next
			});
		}
	});
}

parsers.picasa = function parsePicasa(data) {
	'use strict';
	var dataset, data_item, pattern, desc;

	pattern = /\.jpg$/i;

	dataset = [];

	jQuery.each(data.feed.entry, function (i, item) {
		data_item = {};
		data_item.image = item.media$group.media$content[0].url;
		data_item.thumb = item.media$group.media$thumbnail[1].url;
		desc = item.title.$t;

		if (desc.match(pattern)) {
			desc = "";
		}

		data_item.description = "";
		data_item.description += desc;

		if (item.media$group.media$content.height > config.GALLERY_HEIGHT) {
			config.GALLERY_HEIGHT = item.media$group.media$content[0].height;
		}

		jQuery.each(item.link, function (j, jtem) {
			if (jtem.rel === 'alternate' && jtem.type === 'text/html') {
				data_item.link = jtem.href;
			}
		});

		dataset.push(data_item);
	});

	showGallery(dataset);
};

parsers.flickr = function parseFlickr(data) {
	'use strict';
	var dataset, data_item, link_template;

	dataset = [];
	link_template = Handlebars.compile(config.GALLERY_LINK.flickr);

	if (data.stat !== 'fail') {
		jQuery.each(data.photoset.photo, function (i, item) {
			data_item = {};
			data_item.image = item.url_l;
			data_item.thumb = item.url_s;
			data_item.description = item.description._content;
			data_item.link = link_template({
				path_alias: item.pathalias,
				photo_id: item.id,
				set_id: data.photoset.id
			});

			if (item.height_l > config.GALLERY_HEIGHT) {
				config.GALLERY_HEIGHT = item.height_l;
			}

			dataset.push(data_item);
		});

		showGallery(dataset);
	} else {
		failedGalleryInfo(data.code, data.message);
	}
};

function loadGalleryInfo(data) {
	'use strict';
	var data_promise, breadcrumb_template, breadcrumb_html, url_template, url;

	if (config.GALLERY_DATAURL[data.source] === undefined) {
		failedGalleryInfo(1, 'Unknown data url');
		return;
	}

	url_template = Handlebars.compile(config.GALLERY_DATAURL[data.source]);
	url = url_template(data);

	data_promise = jQuery.ajax({
		url: url,
		dataType: 'jsonp'
	});

	if (data.breadcrumb !== undefined && data.breadcrumb.length !== 0) {
		breadcrumb_template = Handlebars.compile(jQuery('#breadcrumb-template').html());
		breadcrumb_html = breadcrumb_template(data).replace(/ - $/, '');
		jQuery('#breadcrumb').html(breadcrumb_html);
		jQuery('#breadcrumb li:last span.divider').remove();
	}

	if (parsers[data.source] === undefined) {
		failedGalleryInfo(1, 'Unknown parser');
		return;
	}

	data_promise.then(parsers[data.source], failedGalleryInfo);
}

jQuery(document).ready(function () {
	'use strict';
	var gallery_promise;

	updateConfigs();

	gallery_promise = jQuery.ajax({
		url: config.DOC_URL,
		dataType: 'jsonp'
	});

	gallery_promise.then(loadGalleryInfo, failedGalleryInfo);
});