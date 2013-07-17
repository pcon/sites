/*jslint browser: true, regexp: true */
/*global Handlebars, jQuery, $ */

var settings, settingsUrl, urlPattern;

settingsUrl = 'http://pcon.cloudant.com/settings/irc';
urlPattern = new RegExp("(http|ftp|https)://[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&amp;:/~+#-]*[\\w@?^=%&amp;/~+#-])?");


Handlebars.registerHelper('rowStyle', function (msgType, nickType) {
	'use strict';
	var styleArray = [];
	styleArray.push(msgType);

	if (msgType === 'notice') {
		styleArray.push('text-warning');
	}

	if (nickType === 'bot') {
		styleArray.push('muted');
	}

	return styleArray.join(' ');
});

Handlebars.registerHelper('emote', function (msgType) {
	'use strict';
	return msgType === 'emote';
});

var QueryString = (function () {
	'use strict';
	var query_string, query, vars, i, pair, arr;

	query_string = {};
	query = window.location.search.substring(1);
	vars = query.split("&");
	for (i = 0; i < vars.length; i = i + 1) {
		pair = vars[i].split("=");
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
		} else if (typeof query_string[pair[0]] === "string") {
			arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
}());

function replaceURLWithHTMLLinks(text) {
	'use strict';
	var exp = '/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig';
	return text.replace(exp, "<a href='$1'>$1</a>"); 
}

function getUrlBase() {
	'use strict';
	return document.URL.substr(0, document.URL.lastIndexOf('/') + 1);
}

function getUrlWithQueryStrings() {
	'use strict';
	var url, paramArray, key;

	url = getUrlBase();
	paramArray = [];

	for (key in QueryString) {
		if (QueryString.hasOwnProperty(key)) {
			paramArray.push(key + '=' + QueryString[key]);
		}
	}

	url += '?' + paramArray.join('&');

	return url;
}

function getChannelUrl(channel) {
	'use strict';
	return window.settings.base_url + '_design/channels/_view/' + channel + '/?startkey="' + window.settings.endDate + '"&endkey="' + window.settings.startDate + '"&descending=true';
}

function getFirstDateUrl(channel) {
	'use strict';
	return window.settings.base_url + '_design/channels/_view/' + channel + '/?limit=1&descending=false';
}

function getIdUrl(id) {
	'use strict';
	return window.settings.base_url + id;
}

function getSearchUrl(term) {
	'use strict';
	return window.settings.base_url + '_design/channels/_search/text?include_docs=true&q=' + term;
}

function setSettings(data) {
	'use strict';
	window.settings = data;
}

function getSettings() {
	'use strict';
	var settingsPromise = jQuery.ajax({
		url: settingsUrl,
		dataType: 'jsonp',
		success: setSettings
	});
}

function printLogs(data) {
	'use strict';
	jQuery('#logs tbody').html('');

	var name_template, row_template, all_data;

	name_template = Handlebars.compile(jQuery('#name-template').html());
	row_template = Handlebars.compile(jQuery('#row-template').html());

	all_data = [];
	all_data.logs = [];

	jQuery.each(data, function (key, value) {
		var log, nickTxt, msgType, nickType, realNick, lowerNick, lowerReal, profile, formattedText, sub_key;

		log = value;
		nickTxt = log.nick;
		msgType = log.type;
		nickType = 'human';
		realNick = log.nick;

		log.channel = log.channel.replace('#', '');

		lowerNick = log.nick.toLowerCase();

		if (typeof window.settings.alias_map[lowerNick] !== 'undefined') {
			realNick = window.settings.alias_map[lowerNick];
		}

		lowerReal = realNick.toLowerCase();

		if (jQuery.inArray(lowerReal, window.settings.bot_list) !== -1) {
			nickType = 'bot';
			log.style = 'muted';
		}

		log.nick_type = nickType;

		if (typeof window.settings.profile_map[lowerReal] !== 'undefined') {
			profile = window.settings.profile_map[lowerReal];
			log.profile = profile;
		}

		formattedText = replaceURLWithHTMLLinks(log.text);

		if (typeof window.settings.substitute_map !== 'undefined' && window.settings.substitute_map) {
			for (sub_key in window.settings.substitute_map) {
				if (window.settings.substitute_map.hasOwnProperty(sub_key)) {
					formattedText = formattedText.replace(sub_key, window.settings.substitute_map[sub_key]);
				}
			}
		}

		log.emote = (msgType === 'emote');
		log.formatted_text = formattedText;
		log.formatted_name = name_template(log);

		all_data.logs.push(log);
	});

	jQuery('#logs tbody').append(row_template(all_data));
	jQuery('a.nick').popover().on('click', function (e) {e.preventDefault(); return true; });
	jQuery('.date-icon').tooltip();
}


function showResults(data) {
	'use strict';
	var ids, url;
	ids = [];

	jQuery.each(data.rows, function (key, value) {
		ids.push('"' + value.id + '"');
	});

	url = getIdUrl(QueryString.channel, ids);

	jQuery.ajax({
		url: url,
		dataType: 'jsonp',
		success: printLogs
	});
}

function parseSearchLogs(data) {
	'use strict';
	var logs = [];

	jQuery.each(data.rows, function (key, value) {
		logs.push(value.doc);
	});

	printLogs(logs);
}

function search(term) {
	'use strict';
	var url = getSearchUrl(term);

	jQuery.ajax({
		url: url,
		dataType: 'jsonp',
		success: parseSearchLogs
	});
}

function parseIdLogs(data) {
	'use strict';
	var logs = [];
	logs.push(data);
	printLogs(logs);
}

function getId(id) {
	'use strict';
	var url = getIdUrl(id);

	jQuery.ajax({
		url: url,
		dataType: 'jsonp',
		success: parseIdLogs
	});
}

function parseNormalLogs(data) {
	'use strict';
	var logs = [];

	jQuery.each(data.rows, function (key, value) {
		logs.push(value.value);
	});

	printLogs(logs);
}

function getLogs() {
	'use strict';
	var channel, url, page_title_template, tmpl_data, now, startDate, endDate, firstLog;

	tmpl_data = {};
	tmpl_data.channel = channel;

	if (typeof QueryString.channel !== 'undefined') {
		jQuery('#channel option').each(function () {
			if (jQuery(this).val() === QueryString.channel) {
				jQuery(this).attr('selected', 'selected');
			}
		});
	} else {
		QueryString.channel = jQuery('#channel :selected').val();
	}

	channel = jQuery('#channel :selected').val();
	url = getChannelUrl(channel);

	page_title_template = Handlebars.compile(jQuery('#title-template').html());

	jQuery('#log-title').html(page_title_template(tmpl_data));

	if (typeof QueryString.search !== 'undefined' && QueryString.search) {
		jQuery('#search-text').val(QueryString.search);
		search(QueryString.search);
	} else if (typeof QueryString.id !== 'undefined' && QueryString.id) {
		getId(QueryString.id);
	} else {
		jQuery.ajax({
			url: url,
			dataType: 'jsonp',
			success: parseNormalLogs
		});

		now = new Date(window.settings.now);
		startDate = new Date(window.settings.startDate);
		endDate = new Date(window.settings.endDate);
		firstLog = new Date(window.settings.firstLog);

		if (startDate > firstLog) {
			delete QueryString.startDate;
			QueryString.endDate = window.settings.startDate;
			jQuery('.next').removeClass('disabled');
			jQuery('.next a').attr('href', getUrlWithQueryStrings());
			delete QueryString.endDate;
		}

		if (endDate < now) {
			delete QueryString.endDate;
			QueryString.startDate = window.settings.endDate;
			jQuery('.previous').removeClass('disabled');
			jQuery('.previous a').attr('href', getUrlWithQueryStrings());
			delete QueryString.startDate;
		}
	}
}

function channelChange() {
	'use strict';
	var channel, newUrl, loading_template;

	loading_template = Handlebars.compile(jQuery('#loading-template').html());

	channel = jQuery('#channel :selected').val();
	newUrl = document.URL.substr(0, document.URL.lastIndexOf('/') + 1);
	newUrl += '?channel=' + channel;

	QueryString.channel = channel;

	if (typeof QueryString.search !== 'undefined' && QueryString.search) {
		newUrl += '&search=' + QueryString.search;
	}

	window.history.pushState({}, "", newUrl);

	jQuery('#logs tbody').html(loading_template);

	getLogs();
}

jQuery(document).ready(function () {
	'use strict';
	var channel, newUrl, loading_template;

	loading_template = Handlebars.compile(jQuery('#loading-template').html());

	if (typeof QueryString.channel === 'undefined') {
		channel = jQuery('#channel :selected').val();
		newUrl = getUrlBase();
		newUrl += '?channel=' + channel;
		window.history.pushState({}, "", newUrl);
	} else {
		jQuery('#channel').val(QueryString.channel);
	}

	jQuery('#logs tbody').html(loading_template);

	getSettings();

	jQuery('#channel').change(channelChange);
});