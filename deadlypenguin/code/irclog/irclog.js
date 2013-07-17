/*jslint browser: true, regexp: true */
/*global config, moment, Handlebars, jQuery, $ */

Handlebars.registerHelper('enriched_content', function (content) {
	'use strict';

	content = content.replace(config.GT_PATTERN, '&gt;');
	content = content.replace(config.LT_PATTERN, '&lt;');
	content = content.replace(config.URL_PATTERN, "<a href='$1'>$1</a>");
	content = content.replace(/with the ID #([0-9]+)/ig, "with the ID #<a href='/code/quotes/#id=$1'>$1</a>");
	content = content.replace(/\[([0-9]+)\]/ig, "[<a href='/code/quotes/#id=$1'>$1</a>]");
	content = content.replace(/(\S+) now has (-?[0-9]+) point\(s\) of karma/ig, "<a href='/code/karma/?nick=$1'>$1</a> now has $2 point(s) of karma");

	return content;
});

Handlebars.registerHelper('enriched_nick', function (nick) {
	'use strict';
	var currentNick, template, enrichedNick;
	
	currentNick = nick;
	enrichedNick = nick;

	if (config.ALIAS_MAP[nick] !== undefined) {
		currentNick = config.ALIAS_MAP[nick];
	}

	if (config.PROFILE_MAP[currentNick.toLowerCase()] !== undefined) {
		template = Handlebars.compile(jQuery('#name-template').html());
		enrichedNick = template(config.PROFILE_MAP[currentNick.toLowerCase()]);
	}

	return enrichedNick;
});

Handlebars.registerHelper('enriched_style', function (obj) {
	'use strict';
	var styles;

	styles = [];

	if (jQuery.inArray(obj.nick.toLowerCase(), config.BOT_LIST) !== -1) {
		styles.push('bot');
	}

	return styles.join(' ');
});

Handlebars.registerHelper('if_inchannel', function (channel, options) {
	'use strict';

	if ('#' + config.CHANNEL === channel) {
		return options.fn(this);
	}

	return options.inverse(this);
});

Handlebars.registerHelper('if_emote', function (type, options) {
	'use strict';
	if (type === 'emote') {
		return options.fn(this);
	}

	return options.inverse(this);
});

function lpad(value, padding) {
	'use strict';
	var zeroes, i;

	zeroes = "0";
	for (i = 0; i < padding; i += 1) {
		zeroes += "0";
	}

	return (zeroes + value).slice(padding * -1);
}

function getURLParameter(sParam) {
	'use strict';
	var sPageURL, sURLVariables, sParameterName, i;

	sPageURL = window.location.search.substring(1);
	sURLVariables = sPageURL.split('&');
	for (i = 0; i < sURLVariables.length; i += 1) {
		sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] === sParam) {
			return sParameterName[1];
		}
	}
}

function getFormattedDate(m) {
	'use strict';
	return m.format(config.DATE_TEMPLATE);
}

function getSettingsFromUrl() {
	'use strict';
	var template, sDate, eDate, cDate, lDate, nDate, pDate;

	cDate = moment();
	sDate = moment();
	eDate = moment();
	lDate = moment(config.OLDEST_DATE);

	if (getURLParameter('channel') !== undefined) {
		config.CHANNEL = getURLParameter('channel');
		jQuery('#channel [value=' + config.CHANNEL + ']').prop('selected', true);
	} else {
		config.CHANNEL = jQuery('#channel :selected').val();
	}

	if (getURLParameter('startDate') !== undefined) {
		config.START_DATE = getURLParameter('startDate');
		sDate = moment(config.START_DATE);
	}

	if (config.START_DATE === undefined || !sDate.isValid()) {
		config.START_DATE = getFormattedDate(sDate);
	}

	if (getURLParameter('endDate') !== undefined) {
		config.END_DATE = getURLParameter('endDate');
		eDate = moment(config.END_DATE);

		if (getURLParameter('startDate') === undefined) {
			sDate = eDate.subtract('days', 1);
			config.START_DATE = getFormattedDate(sDate);
		}
	} else {
		eDate = sDate.add('days', 1);
		config.END_DATE = getFormattedDate(eDate);
	}

	if (eDate < cDate) {
		template = Handlebars.compile(config.URL_PAGE_TEMPLATE);
		config.URL_NEXT = template({
			channel: config.CHANNEL,
			startDate: config.END_DATE
		});
	}

	if (sDate > lDate) {
		template = Handlebars.compile(config.URL_PAGE_TEMPLATE);
		config.URL_PREV = template({
			channel: config.CHANNEL,
			endDate: config.START_DATE
		});
	}

	if (getURLParameter('id') !== undefined) {
		config.IDS = [];
		config.IDS.push('"' + getURLParameter('id') + '"');
	}

	if (getURLParameter('search') !== undefined && jQuery.trim(getURLParameter('search')) !== '') {
		config.QUERY_STRING = getURLParameter('search');
		jQuery('#search-text').val(config.QUERY_STRING);
	}
}

function failedSettings(data) {
	'use strict';
	var template = Handlebars.compile(jQuery('#failedsettings-template').html());
	jQuery('#logs caption').html(template({}));
}

function failedLogs(data) {
	'use strict';
	var template = Handlebars.compile(jQuery('#failedlogs-template').html());
	jQuery('#logs caption').html(template({}));
}

function parseSettings(data) {
	'use strict';
	var template;

	template = Handlebars.compile(config.URL_CLOUDANT_STANDARD_TEMPLATE);

	config.BASE_URL = data.base_url;
	config.ALIAS_MAP = data.alias_map;
	config.PROFILE_MAP = data.profile_map;
	config.BOT_LIST = data.bot_list;
	config.SUB_LIST = data.substitue_list;

	config.OLDEST_DATE = '2013-05-27';

	getSettingsFromUrl();

	if (config.IDS !== undefined) {
		template = Handlebars.compile(config.URL_CLOUDANT_ID_TEMPLATE);

		config.LOG_URL = template({
			base_url: config.BASE_URL,
			ids: config.IDS.join(',')
		});

		config.URL_PREV = undefined;
		config.URL_NEXT = undefined;
	} else if (config.QUERY_STRING !== undefined) {
		template = Handlebars.compile(config.URL_CLOUDANT_SEARCH_TEMPLATE);

		config.LOG_URL = template({
			base_url: config.BASE_URL,
			channel: config.CHANNEL,
			query: config.QUERY_STRING
		});

		config.URL_PREV = undefined;
		config.URL_NEXT = undefined;
	} else {
		config.LOG_URL = template({
			base_url: config.BASE_URL,
			channel: config.CHANNEL,
			startKey: config.END_DATE,
			endKey: config.START_DATE
		});
	}
}

function parseLogs(data) {
	'use strict';
	var logs, template;

	logs = [];

	jQuery.each(data.rows, function (i, item) {
		if (item.doc !== undefined) {
			logs.push(item.doc);
		} else {
			logs.push(item.value);
		}
	});

	template = Handlebars.compile(jQuery('#row-template').html());
	jQuery('#logs tbody').html(template({logs: logs}));
	jQuery('a.nick').popover().on('click', function (e) {
		e.preventDefault();
		return true;
	});

	if (config.URL_PREV !== undefined) {
		jQuery('li.previous a').attr('href', config.URL_PREV);
		jQuery('li.previous').removeClass('disabled');
	}

	if (config.URL_NEXT !== undefined) {
		jQuery('li.next a').attr('href', config.URL_NEXT);
		jQuery('li.next').removeClass('disabled');
	}
}

function fetchLogs() {
	'use strict';
	var logPromise;

	logPromise = jQuery.ajax({
		url: config.LOG_URL,
		dataType: 'jsonp'
	});

	logPromise.then(parseLogs, failedLogs);
}

jQuery(document).ready(function () {
	'use strict';
	var settingsPromise;

	settingsPromise = jQuery.ajax({
		url: config.URL_SETTINGS,
		dataType: 'jsonp'
	});

	settingsPromise.then(parseSettings, failedSettings);
	settingsPromise.done(fetchLogs);
});