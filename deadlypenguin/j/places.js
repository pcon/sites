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

function loadUSA(data) {
	r_us = Raphael("us_wrapper", 450, 450);

	jQuery.each(data.rows, function(index, doc) {
		var item = doc.key;
		item.id = doc.id;

		us[item.id] = r_us.path(item.coords).attr(default_attr).attr({title: item.name});

		if (item.url !== undefined) {
			if (typeof us[item.id][0].style !== 'undefined') {
				us[item.id][0].style.cursor = "pointer";
			}

			us[item.id][0].onmouseover = function() {
				us[item.id].animate({fill: color_hover}, 500);
				r_us.safari();
			};

			us[item.id][0].onmouseout = function() {
				us[item.id].animate({fill: color_visited}, 500);
				r_us.safari();
			};

			us[item.id].attr(visited_attr).attr({target: item.url}).click(clickMap);
		}
	});

	//Since DC is a special snowflake, let's deal with it now
	var font = r_us.getFont("Myriad");
	us['us_DC'] = r_us.print(415, 210, 'DC', font, 20).attr(visited_attr);

	if (typeof us['us_DC'][0].style !== 'undefined') {
		us['us_DC'][0].style.cursor = "pointer";
	}
			
	us['us_DC'][0].onmouseover = function() {
		us['us_DC'].animate({fill: color_hover}, 500);
		r_us.safari();
	};        
	us['us_DC'][0].onmouseout = function() {
		us['us_DC'].animate({fill: color_visited}, 500);
		r_us.safari();
	};

	us['us_DC'].attr(visited_attr).attr({target: '/places/us/dc/'}).click(clickMap);
}

function loadEurope(data) {
	r_eu = Raphael("eu_wrapper", 450, 450);

	jQuery.each(data.rows, function(index, doc) {
		var item = doc.key;
		item.id = doc.id;

		eu[item.id] = r_eu.path(item.coords).attr(default_attr).attr(eu_attr).attr({title: item.name});

		if (item.url !== undefined) {
			if (typeof eu[item.id][0].style !== 'undefined') {
				eu[item.id][0].style.cursor = "pointer";
			}

			eu[item.id][0].onmouseover = function() {
				eu[item.id].animate({fill: color_hover}, 500);
				r_eu.safari();
			};
			eu[item.id][0].onmouseout = function() {
				eu[item.id].animate({fill: color_visited}, 500);
				r_eu.safari();
			};

			eu[item.id].attr(visited_attr).attr({target: item.url}).click(clickMap);
		}
	});
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

		jQuery.ajax({
			url: 'http://map.deadlypenguin.com/_design/maps/_view/usa/',
			success: loadUSA,
			dataType: 'jsonp'
		});

		jQuery.ajax({
			url: 'http://map.deadlypenguin.com/_design/maps/_view/europe/',
			success: loadEurope,
			dataType: 'jsonp'
		});
	} else {
		var json_path = 'http://places.deadlypenguin.com/';
		for (i = 1; i < parts.length; i++) {
			json_path = json_path + parts[i] + '-';
		}

		json_path = json_path.replace(/-$/, '');

		jQuery.ajax({url: json_path, success: loadPlace, dataType: 'jsonp'});
	}
});