/*jslint browser: true, regexp: true */
/*global Handlebars, config, moment, jQuery, $ */

function show_all_karma(data) {
	'use strict';

	var karma, tuples, key, value, i, template, max_karma, pair, all_nicks, nick_pair;

	karma = data.rows[0].value.scores[0];
	tuples = [];
	max_karma = 0;


	for (key in karma) {
		if (karma.hasOwnProperty(key)) {
			if (max_karma < parseInt(karma[key], 10)) {
				max_karma = parseInt(karma[key], 10);
			}

			tuples.push([key, parseInt(karma[key], 10)]);
		}
	}

	tuples.sort(function (a, b) {
		a = a[1];
		b = b[1];

		return a > b ? -1 : (a < b ? 1 : 0);
	});

	all_nicks = [];

	for (i = 0; i < tuples.length; i += 1) {
		nick_pair = {};
		pair = tuples[i];
		nick_pair.nick = pair[0];
		nick_pair.karma = pair[1];
		nick_pair.percent = (nick_pair.karma / max_karma) * 100;
		all_nicks.push(nick_pair);
	}

	template = Handlebars.compile(jQuery('#list-template').html());
	jQuery('#karma_list').html(template({all_nicks: all_nicks}));
}

jQuery(document).ready(function () {
	'use strict';

	var allkarma_promise;

	allkarma_promise = jQuery.ajax({
		url: config.URL_MOST_RECENT,
		dataType: 'jsonp'
	});

	allkarma_promise.then(show_all_karma);
});