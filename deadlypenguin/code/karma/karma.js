/*jslint browser: true, regexp: true */
/*global google, Handlebars, config, moment, jQuery, $ */

var parsers, typeaheadData;
parsers = {};
typeaheadData = [];

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

function updateURL() {
	'use strict';
	var template;

	template = Handlebars.compile(config.SEARCH_TEMPLATE);
	window.location.search = template({
		nick: jQuery('#nick').val(),
		to: config.TO,
		from: config.FROM
	});
}

function selectedNick() {
	'use strict';
	var newNick, nickList;

	nickList = jQuery('#nick').val().split(',');
	nickList.push(jQuery('#new-nick-input').val());
	jQuery('#nick').val(nickList.join(','));
	updateURL();

	return false;
}

function addNick() {
	'use strict';
	var template;

	template = Handlebars.compile(jQuery('#new-nick-template').html());

	jQuery('#new-nick').popover({
		placement: 'right',
		title: 'Add Nick',
		html: true,
		content: template({})
	}).popover('show');

	jQuery('#new-nick-input').typeahead({
		source: typeaheadData
	});

	return false;
}

function failedTypeahead() {
	'use strict';
}

function populateTypeahead(data) {
	'use strict';

	typeaheadData = [];

	jQuery.each(data.rows, function (i, item) {
		typeaheadData.push(item.key);
	});
}

function fetchTypeahead() {
	'use strict';
	var nicklistPromise;

	nicklistPromise = jQuery.ajax({
		url: config.VALUE_LIST_URL,
		dataType: 'jsonp'
	});

	nicklistPromise.then(populateTypeahead, failedTypeahead);
}


function failedKarma() {
	'use strict';
	var template = Handlebars.compile(jQuery('#error-template').html());
	jQuery('#chart_div').html(template({}));
}

function drawChart(formattedData) {
	'use strict';
	var data, options, chart;

	data = google.visualization.arrayToDataTable(formattedData);

	options = {
		title: 'Karma'
	};

	chart = new google.visualization.LineChart(document.getElementById('chart_div'));
	chart.draw(data, options);
}

parsers.single = function parseSingle(data) {
	'use strict';
	var formattedData = [];
	formattedData.push(['Date', config.NICK_LIST[0].split('"')[1]]);

	jQuery.each(data.rows, function (i, item) {
		formattedData.push([item.id, Number(item.value)]);
	});

	jQuery('#from').val(data.rows[0].id);
	jQuery('#to').val(data.rows[data.rows.length - 1].id);

	drawChart(formattedData);
};

parsers.multi = function parseMulti(data) {
	'use strict';
	var formattedData, headerData, dayData, byNick, largestNick, smallest_moment, largest_moment, m, k;

	byNick = {};
	formattedData = [];
	headerData = [];
	headerData.push('Date');

	jQuery.each(config.UNQUOTED_NICK_LIST, function (i, item) {
		byNick[item] = {};
		headerData.push(item);
	});

	formattedData.push(headerData);

	jQuery.each(data.rows, function (j, jtem) {
		var nick_data;

		m = moment(jtem.id);

		if (m >= config.FROM_MOMENT && m <= config.TO_MOMENT) {
			if (smallest_moment === undefined || m < smallest_moment) {
				smallest_moment = m;
			}

			if (largest_moment === undefined || m > largest_moment) {
				largest_moment = m;
			}

			byNick[jtem.key][jtem.id] = jtem.value;
		}
	});

	jQuery('#from').val(smallest_moment.format(config.DATE_FORMAT));
	jQuery('#to').val(largest_moment.format(config.DATE_FORMAT));

	for (m = smallest_moment; m <= largest_moment; m.add('days', 1)) {
		dayData = [];
		dayData.push(m.format(config.DATE_FORMAT));

		for (k = 0; k < config.UNQUOTED_NICK_LIST.length; k = k + 1) {
			if (byNick[config.UNQUOTED_NICK_LIST[k]][m.format(config.DATE_FORMAT)] !== undefined) {
				dayData.push(Number(byNick[config.UNQUOTED_NICK_LIST[k]][m.format(config.DATE_FORMAT)]));
			} else {
				dayData.push(null);
			}
		}

		formattedData.push(dayData);
	}

	drawChart(formattedData);
};

function fetchKarma() {
	'use strict';
	var karmaPromise;

	karmaPromise = jQuery.ajax({
		url: config.KARMA_URL,
		dataType: 'jsonp'
	});

	karmaPromise.then(parsers[config.TYPE], failedKarma);

	fetchTypeahead();
}

function parseSettings() {
	'use strict';
	var template;

	config.MAX_DATE = moment().subtract('days', 1).format(config.DATE_FORMAT);

	if (jQuery('#to').val() !== '') {
		config.TO = jQuery('#to').val();
		config.TO_MOMENT = moment(config.TO);
	} else {
		config.TO_MOMENT = moment('2900-01-01');
	}

	if (jQuery('#from').val() !== '') {
		config.FROM = jQuery('#from').val();
		config.FROM_MOMENT = moment(config.FROM);
	} else {
		config.FROM_MOMENT = moment('1900-01-01');
	}

	config.NICK_LIST = [];
	config.UNQUOTED_NICK_LIST = [];

	jQuery.each(jQuery('#nick').val().split(','), function (i, item) {
		config.NICK_LIST.push('"' + item.toLowerCase() + '"');
		config.UNQUOTED_NICK_LIST.push(item.toLowerCase());
	});

	if (config.NICK_LIST.length === 1) {
		config.TYPE = 'single';
		template = Handlebars.compile(config.URL_SINGLE_NICK_TEMPLATE);
		config.KARMA_URL = template({
			nick: config.NICK_LIST[0],
			startdate: config.FROM,
			enddate: config.TO
		});
	} else {
		config.TYPE = 'multi';
		template = Handlebars.compile(config.URL_MULTI_NICK_TEMPLATE);

		config.KARMA_URL = template({
			nicks: config.NICK_LIST.join(',')
		});
	}

	jQuery('#from-calendar').datepicker({
		date: config.FROM_MOMENT.toDate(),
		format: config.DATE_FORMAT,
		startDate: moment(config.MIN_DATE).toDate(),
		endDate: config.TO_MOMENT.toDate()
	}).on('changeDate', function (e) {
		config.FROM = moment(e.date).format(config.DATE_FORMAT);
		config.FROM_MOMENT = moment(config.FROM);
		updateURL();
	});

	jQuery('#to-calendar').datepicker({
		date: config.TO_MOMENT.toDate(),
		format: config.DATE_FORMAT,
		startDate: config.FROM_MOMENT.toDate(),
		endDate: moment(config.MAX_DATE).toDate()
	}).on('changeDate', function (e) {
		config.TO = moment(e.date).format(config.DATE_FORMAT);
		config.TO_MOMENT = moment(config.FROM);
		updateURL();
	});

	fetchKarma();
}

function parseURLSettings() {
	'use strict';

	if (getURLParameter('nick') !== undefined) {
		jQuery('#nick').val(getURLParameter('nick'));
	} else {
		jQuery('#nick').value('oorgle');
		updateURL();
	}

	if (getURLParameter('from') !== undefined) {
		jQuery('#from').val(getURLParameter('from'));
		config.FROM = getURLParameter('from');
	}

	if (getURLParameter('to') !== undefined) {
		jQuery('#to').val(getURLParameter('to'));
		config.TO = getURLParameter('to');
	}

	parseSettings();
}

google.load("visualization", "1", {packages: [ "corechart" ]});
google.setOnLoadCallback(parseURLSettings);
