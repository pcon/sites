/*jslint browser: true, regexp: true */
/*global google, jQuery, $ */

var TODAY, START_DATE, END_DATE, usernames, names, firstDay, firstDate, lastDay, lastDate, fromDay, fromDate, toDay, toDate, buildDataSet;

TODAY = new Date();
START_DATE = '2012-10-26';
END_DATE = TODAY.getFullYear() + '-' + (TODAY.getMonth() + 1) + '-' + TODAY.getDate();

usernames = null;
names = null;

firstDay = null;
firstDate = null;
lastDay = null;
lastDate = null;
fromDay = null;
fromDate = null;
toDay = null;
toDate = null;

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

function showLoadingDialog() {
	'use strict';
	jQuery('#dialog').dialog({modal: true});
	jQuery('#dialog').dialog("open");
}

function hideLoadingDialog() {
	'use strict';
	jQuery('#dialog').dialog("close");
}

function split(val) {
	'use strict';
	return val.split(/,\s*/);
}

function extractLast(term) {
	'use strict';
	return split(term).pop();
}

function updateUrl(currNick, curFromDay, curToDay) {
	'use strict';
	var newUrl = document.URL.substr(0, document.URL.lastIndexOf('/') + 1);
	newUrl += '?nick=' + currNick + '&from=' + curFromDay + '&to=' + curToDay;
	window.history.pushState({}, "", newUrl);
}

function fetchKarma() {
	'use strict';
	var url;

	if (window.usernames === null && QueryString.nick !== undefined) {
		usernames = QueryString.nick;
	} else if (window.usernames === null) {
		usernames = 'oorgle';
	}

	if (fromDay === null && QueryString.from !== undefined) {
		fromDay = QueryString.from;
		fromDate = Date.parse(fromDay);
	}

	if (toDay === null && QueryString.to !== undefined) {
		toDay = QueryString.to;
		toDate = Date.parse(toDay);
	}

	url = 'http://db.deadlypenguin.com/karma/_design/karma/_view/all/?nick=' + usernames;

	if (fromDay !== null) {
		url += '&startkey="' + fromDay + '"';
	}

	if (toDay !== null) {
		url += '&endkey="' + toDay + '"';
	}

	showLoadingDialog();
	jQuery.ajax({
		url: url,
		dataType: 'jsonp',
		success: buildDataSet
	});
}

function selectedNick(event, ui) {
	'use strict';
	var names = split(jQuery('#nicks').val());
	names.pop();
	names.push(ui.item.value);
	names.push("");

	usernames = names.join(',');

	updateUrl(window.usernames, window.fromDay, window.toDay);
	ui.item.value = usernames;
	fetchKarma();
}

function drawChart(arrayData) {
	'use strict';
	var data, options, chart;

	data = google.visualization.arrayToDataTable(arrayData);

	options = {
		title: 'Karma'
	};

	chart = new google.visualization.LineChart(document.getElementById('chart_div'));
	chart.draw(data, options);
	hideLoadingDialog();
}

buildDataSet = function (data) {
	'use strict';
	var uArray, myArray, row, index, item;

	jQuery('#nicks').val(usernames);

	uArray = split(usernames);
	if (uArray[uArray.length - 1] === '') {
		uArray.pop();
	}

	myArray = [];

	row = [];
	row.push('Date');


	for (index in uArray) {
		if (uArray.hasOwnProperty(index)) {
			row.push(uArray[index]);
		}
	}

	myArray.push(row);

	if (lastDay === null) {
		item = data.rows[data.rows.length - 1];
		lastDay = item.id;
		lastDate = Date.parse(lastDay);

		if (toDay === null) {
			toDay = lastDay;
			toDate = lastDate;
		}
	}


	jQuery.each(data.rows, function (i, doc) {
		var item, key, itemDate, row, index;

		item  = doc.value;
		item.id = doc.id;
		if (firstDay === null) {
			firstDay = item.id;
			firstDate = Date.parse(firstDay);

			if (fromDay === null) {
				fromDay = firstDay;
				fromDate = firstDate;
			}
		}

		if (lastDay === null && i + 1 === data.rows.length) {
			lastDay = item.id;
			lastDate = Date.parse(lastDay);

			if (toDay === null) {
				toDay = lastDay;
				toDate = lastDate;
			}
		}

		if (names === null && i + 1 === data.rows.length) {
			names = [];
			for (key in item.scores[0]) {
				if (item.scores[0].hasOwnProperty(key)) {
					names.push(key);
				}
			}

			jQuery('#nicks').bind("keydown", function (event) {
				if (event.keyCode === jQuery.ui.keyCode.TAB && jQuery(this).data("autocomplete").menu.active) {
					event.preventDefault();
				}
			}).autocomplete({
				minLength: 0,
				source: function (request, response) {
					response(jQuery.ui.autocomplete.filter(names, extractLast(request.term)));
				},
				focus: function () {
					return false;
				},
				select: selectedNick
			});
		}

		itemDate = Date.parse(item.id);

		if (itemDate >= fromDate && itemDate <= toDate) {
			row = [];
			row.push(item.id);

			for (index in uArray) {
				if (uArray.hasOwnProperty(index)) {
					row.push(Number(item.scores[0][uArray[index]]));
				}
			}
			
			myArray.push(row);
		}
	});

	jQuery("#from").datepicker({
		dateFormat: "yy-mm-dd",
		defaultDate: fromDay,
		minDate: START_DATE,
		maxDate: lastDay,
		changeMonth: true,
		numberOfMonths: 3,
		onClose: function (selectedDate) {
			jQuery("#to").datepicker("option", "minDate", selectedDate);
			fromDay = selectedDate;
			fromDate = Date.parse(fromDay);
			updateUrl(window.username, window.fromDay, window.toDay);
			fetchKarma();
		}
	}).val(fromDay);

	jQuery("#to").datepicker({
		dateFormat: "yy-mm-dd",
		defaultDate: toDay,
		minDate: firstDay,
		maxDate: END_DATE,
		changeMonth: true,
		numberOfMonths: 3,
		onClose: function (selectedDate) {
			jQuery("#from").datepicker("option", "maxDate", selectedDate);
			toDay = selectedDate;
			toDate = Date.parse(toDay);
			updateUrl(window.username, window.fromDay, window.toDay);
			fetchKarma();
		}
	}).val(toDay);

	drawChart(myArray);
};

google.load("visualization", "1", {packages: [ "corechart" ]});
google.setOnLoadCallback(fetchKarma);