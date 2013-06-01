/*jslint browser: true, regexp: true */
/*global config, Handlebars, jQuery, $ */

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

function displayQuotes(tmpl_data) {
	'use strict';
	var template = Handlebars.compile(jQuery('#quote-template').html());

	jQuery('#content').html(template(tmpl_data));
	jQuery('#content blockquote:nth-of-type(even)').addClass('pull-right');
}

function parseQuoteView(data) {
	'use strict';
	var tmpl_data, quote;

	tmpl_data = {};
	tmpl_data.quotes = [];

	jQuery.each(data.rows, function (key, value) {
		quote = value.value;
		quote.id = value.id;
		tmpl_data.quotes.push(quote);
	});

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

function loadQuotes() {
	'use strict';
	var url, view_promise;

	url = config.DEFAULT_QUERY;
	view_promise = jQuery.ajax({
		url: url,
		dataType: 'jsonp'
	});

	view_promise.then(parseQuoteView, failedQuotes);
}

function searchById(id) {
	'use strict';
	var ids, template, url, view_promise;

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
	searchById(id);
}

function searchByText(searchString) {
	'use strict';
	var template, url, search_promise;

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
	searchByText(searchString);
}

function searchByNick(nick) {
	'use strict';
	var template, url, search_promise;

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
	searchByNick(nick);
}

function populateNicks(data) {
	'use strict';
	var nicks = [];

	jQuery.each(data.rows, function (key, value) {
		nicks.push(value.key);
	});

	jQuery('#nickList').typeahead({
		source: nicks
	});

	jQuery('#nickList').removeClass('uneditable-input');
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

jQuery(document).ready(function () {
	'use strict';
	loadQuotes();
	loadNicks();
});