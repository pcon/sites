/*jslint browser: true, regexp: true */
/*global config, Handlebars, jQuery, $ */

var loadQuotes, handlers;

handlers = {};

function updateUrl(param, value) {
	'use strict';
	window.location.hash = param + '=' + value;
}

function clearAllExcept(name) {
	'use strict';
	var foundName;

	jQuery('input').each(function (key, value) {
		foundName = jQuery(value).attr('id');
		if (foundName !== name) {
			jQuery(value).val('');
		}
	});
}

function removePager() {
	'use strict';
	jQuery('#pager').remove();
}

function failedQuotes(data) {
	'use strict';
	var template;

	template = Handlebars.compile(jQuery('#failed-template').html());
	jQuery('#title').after(template({}));
}

function failedNicks(data) {
	'use strict';
	var template;

	template = Handlebars.compile(jQuery('#failed-nicks-template').html());
	jQuery('#title').after(template({}));
}

function updateOffset(modifier) {
	'use strict';

	config.LIST_OFFSET += parseInt(modifier, 10);
	config.LIST_OFFSET = (config.LIST_OFFSET < 0) ? 0 : config.LIST_OFFSET;

	updateUrl('page', (config.LIST_OFFSET / config.LIST_LIMIT) + 1);

	jQuery('html, body').animate({scrollTop: 0}, 'slow');
	loadQuotes();
}

function displayQuotes(tmpl_data) {
	'use strict';
	var template = Handlebars.compile(jQuery('#quote-template').html());

	tmpl_data.limit = config.LIST_LIMIT;

	jQuery('#content').html(template(tmpl_data));
	jQuery('#content blockquote:odd').addClass('pull-right');
	jQuery('#content-mobile').html(template(tmpl_data));
	jQuery('#content-mobile blockquote:odd').addClass('pull-right');

	if (!config.SHOW_PAGER) {
		removePager();
		config.SHOW_PAGER = true;
	} else {
		if (tmpl_data.offset !== 0) {
			jQuery('.previous').removeClass('disabled');
		} else {
			jQuery('.previous').addClass('disabled');
		}

		if (tmpl_data.offset + tmpl_data.display_rows < tmpl_data.total_rows) {
			jQuery('.next').removeClass('disabled');
		} else {
			jQuery('.next').addClass('disabled');
		}
	}
}

function parseQuoteView(data) {
	'use strict';
	var tmpl_data, quote;

	tmpl_data = {};
	tmpl_data.quotes = [];
	tmpl_data.total_rows = data.total_rows;
	tmpl_data.offset = data.offset;

	jQuery.each(data.rows, function (key, value) {
		quote = value.value;
		quote.id = value.id;
		tmpl_data.quotes.push(quote);
	});

	tmpl_data.display_rows = tmpl_data.quotes.length;

	displayQuotes(tmpl_data);
}

function parseQuoteSearch(data) {
	'use strict';
	var template, ids, url, view_promise;

	ids = [];

	jQuery.each(data.rows, function (key, value) {
		ids.push('%22' + value.id + '%22');
	});

	template = Handlebars.compile(config.ID_QUERY);
	url = template({keys: ids.reverse().join()});

	view_promise = jQuery.ajax({
		url: url,
		dataType: 'jsonp'
	});

	view_promise.then(parseQuoteView, failedQuotes);
}

loadQuotes = function () {
	'use strict';
	var template, url, view_promise;

	config.SHOW_PAGER = true;

	template = Handlebars.compile(config.DEFAULT_QUERY);
	url = template({limit: config.LIST_LIMIT, offset: config.LIST_OFFSET});

	view_promise = jQuery.ajax({
		url: url,
		dataType: 'jsonp'
	});

	view_promise.then(parseQuoteView, failedQuotes);
};

function searchById(id) {
	'use strict';
	var ids, template, url, view_promise;

	config.SHOW_PAGER = false;
	jQuery('#idInput').val(id);
	clearAllExcept('idInput');

	ids = [];
	ids.push('%22' + id + '%22');

	template = Handlebars.compile(config.ID_QUERY);
	url = template({keys: ids.reverse().join()});

	view_promise = jQuery.ajax({
		url: url,
		dataType: 'jsonp'
	});

	view_promise.then(parseQuoteView, failedQuotes);
}

function searchId() {
	'use strict';
	var id;

	id = jQuery('#idInput').val();
	updateUrl('id', id);
	searchById(id);
}

function searchByText(searchString) {
	'use strict';
	var template, url, search_promise;

	config.SHOW_PAGER = false;
	jQuery('#search').val(searchString);
	clearAllExcept('search');

	template = Handlebars.compile(config.SEARCH_QUERY);
	url = template({needle: searchString});

	search_promise = jQuery.ajax({
		url: url,
		dataType: 'jsonp'
	});

	search_promise.then(parseQuoteSearch, failedQuotes);
}

function searchText() {
	'use strict';
	var searchString;

	searchString = jQuery('#search').val();
	updateUrl('search', searchString);
	searchByText(searchString);
}

function searchByNick(nick) {
	'use strict';
	var template, url, search_promise;

	config.SHOW_PAGER = false;
	jQuery('#nickList').val(nick);
	clearAllExcept('nickList');

	template = Handlebars.compile(config.NICK_QUERY);
	url = template({nick: nick});

	search_promise = jQuery.ajax({
		url: url,
		dataType: 'jsonp'
	});

	search_promise.then(parseQuoteSearch, failedQuotes);
}

function searchNick() {
	'use strict';
	var nick;

	nick = jQuery('#nickList').val();
	updateUrl('nick', nick);
	searchByNick(nick);
}

function populateNicks(data) {
	'use strict';
	var nicks = [];

	jQuery.each(data.rows, function (key, value) {
		nicks.push(value.key);
	});

	jQuery('#nickList').autocomplete({
		source: nicks
	});

	jQuery('#nickList').prop('disabled', false);
}

function loadNicks() {
	'use strict';
	var url, nick_promise;

	url = config.NICK_LIST;

	nick_promise = jQuery.ajax({
		url: url,
		dataType: 'jsonp'
	});

	nick_promise.then(populateNicks, failedNicks);
}

function failedQuotees(data) {
	'use strict';

	jQuery('#top_quotees').remove();
}

function populateTopQuotees(data) {
	'use strict';
	var i, tuples, q_data, quotee, template;

	tuples = [];

	for (i = 0; i < data.rows.length; i += 1) {
		tuples.push([data.rows[i].key, data.rows[i].value]);
	}

	tuples.sort(function (a, b) {
		a = a[1];
		b = b[1];

		return a > b ? -1 : (a < b ? 1 : 0);
	});

	q_data = {};
	q_data.quotees = [];

	for (i = 0; i < 10; i += 1) {
		quotee = {};
		quotee.nick = tuples[i][0];
		quotee.count = tuples[i][1];

		q_data.quotees.push(quotee);
	}

	template = Handlebars.compile(jQuery('#quotee-template').html());

	jQuery('#top_quotees').append(template(q_data));
}

function loadTopQuotees() {
	'use strict';
	var url, quotee_promise;

	url = config.NICK_COUNT;

	quotee_promise = jQuery.ajax({
		url: url,
		dataType: 'jsonp'
	});

	quotee_promise.then(populateTopQuotees, failedQuotees);
}

handlers.page = function (value) {
	'use strict';
	config.LIST_OFFSET = config.LIST_LIMIT * (parseInt(value, 10) - 1);
	loadQuotes();
};

handlers.search = function (value) {
	'use strict';
	jQuery('#search').val(value);
	searchByText(value);
};

handlers.nick = function (value) {
	'use strict';
	jQuery('#nickList').val(value);
	searchByNick(value);
};

handlers.none = function () {
	'use strict';
	loadQuotes();
};

handlers.id = function (value) {
	'use strict';
	jQuery('#idInput').val(value);
	searchById(value);
};

jQuery(document).ready(function () {
	'use strict';
	var hash, param, value;

	loadNicks();
	loadTopQuotees();

	if (window.location.hash) {
		hash = window.location.hash.split('#')[1].split('&')[0].split('=');
		if (hash.length !== 2) {
			handlers.none();
		} else {
			param = hash[0];
			value = hash[1];

			if (handlers[param] !== undefined) {
				handlers[param](value);
			} else {
				handlers.none();
			}
		}
	} else {
		handlers.none();
	}
});