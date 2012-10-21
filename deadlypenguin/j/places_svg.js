//http://raphaeljs.com/australia.html
//http://upload.wikimedia.org/wikipedia/commons/3/32/Blank_US_Map.svg

var color_hover = '#4f0000';
var color_visited = '#800000';
var color_default = '#333';
var color_stroke = '#666';

var us = {};
var eu = {};
var place = null;
var cities = {};

var current = null;

var r_us = null;
var r_eu = null;
var r_place = null;

var visited_attr = {
	fill: color_visited,
};

var default_attr = {
	fill: color_default,
	stroke: color_stroke,
	"stroke-width": 1,
	"stroke-linejoin": "round"
};

var eu_attr = {
	fill: color_default,
	stroke: color_stroke,
	"stroke-width": 1.125,
	"stroke-linejoin": "round"
};

function clickMap() {
	if (typeof this.attrs.target !== 'undefined') {
		window.location = this.attrs.target;
	}
}

function setupCountry(data, data_array, r) {
	jQuery.each(data.places, function(index, item) {
		if (typeof data_array[item.id] !== 'undefined') {
			if (typeof data_array[item.id][0].style !== 'undefined') {
				data_array[item.id][0].style.cursor = "pointer";
			}

			data_array[item.id][0].onmouseover = function() {
				data_array[item.id].animate({fill: color_hover}, 500);
				r.safari();
			};
			data_array[item.id][0].onmouseout = function() {
				data_array[item.id].animate({fill: color_visited}, 500);
				r.safari();
			};

			data_array[item.id].attr(visited_attr).attr({target: item.url}).click(clickMap);
		}
	});
}

function setupUSA(data) {
	setupCountry(data, us, r_us);
}

function loadUSA(data) {
	r_us = Raphael("us_wrapper", 450, 450);

	jQuery.each(data.map, function(index, item) {
		us[item.id] = r_us.path(item.coords).attr(default_attr).attr({title: item.name});
	});

	//Since DC is a special snowflake, let's deal with it now

	var font = r_us.getFont("Myriad");
	us['us_DC'] = r_us.print(415, 210, 'DC', font, 20).attr(visited_attr);

	//jQuery.getJSON('http://www.deadlypenguin.com/json/usa_visited.json', setupUSA);
	jQuery.ajax({url: 'http://places.deadlypenguin.com/usa_visited/', success: setupUSA, dataType: 'jsonp'});
}

function setupEurope(data) {
	setupCountry(data, eu, r_eu);
}

function loadEurope(data) {
	r_eu = Raphael("eu_wrapper", 450, 450);

	jQuery.each(data.map, function(index, item) {
		eu[item.id] = r_eu.path(item.coords).attr(default_attr).attr(eu_attr).attr({title: item.name});
	});

	//jQuery.getJSON('http://www.deadlypenguin.com/json/europe_visited.json', setupEurope);
	jQuery.ajax({url: 'http://places.deadlypenguin.com/europe_visited/', success: setupEurope, dataType: 'jsonp'});
}

function loadPlace(data) {
	jQuery('#breadcrumb').append(' - '+'<a href="'+window.location.pathname+'">'+data.name+'</a>');

	r_place = Raphael("wrapper", 900, 450);
	place = r_place.path(data.coords).attr(default_attr);

	jQuery.each(data.areas, function(index, item) {
		var coords = item.coords.split(',');
		cities[item.id] = r_place.circle(coords[0], coords[1], coords[2]).attr(visited_attr).attr({title: item.name, target: item.url}).click(clickMap);
		cities[item.id][0].style.cursor = "pointer";
		cities[item.id][0].onmouseover = function() {
			cities[item.id].animate({fill: color_hover}, 500);
			r_place.safari();
		};
		cities[item.id][0].onmouseout = function() {
			cities[item.id].animate({fill: color_visited}, 500);
			r_place.safari();
		};
	});
}

$(document).ready(function () {
	var pathname = window.location.pathname;
	pathname = pathname.replace(/^\//,'').replace(/\/$/,'');
	var parts = pathname.split('/');

	if (parts.length === 1) {
		jQuery('#wrapper').append('<div id="us_wrapper"></div><div id="eu_wrapper"></div>');

		//jQuery.getJSON('http://www.deadlypenguin.com/json/usa.json', loadUSA);
		//jQuery.getJSON('http://www.deadlypenguin.com/json/europe.json', loadEurope);
		jQuery.ajax({url: 'http://places.deadlypenguin.com/usa/', success: loadUSA, dataType: 'jsonp'});
		jQuery.ajax({url: 'http://places.deadlypenguin.com/europe/', success: loadEurope, dataType: 'jsonp'});
	} else {
		//var json_path = '/json/places/';
		var json_path = 'http://places.deadlypenguin.com/';
		for (i = 1; i < parts.length; i++) {
			json_path = json_path + parts[i] + '-';
		}

		json_path = json_path.replace(/-$/, '');

		//jQuery.getJSON(json_path, loadPlace);
		jQuery.ajax({url: json_path, success: loadPlace, dataType: 'jsonp'});
	}
});