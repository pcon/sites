var currentSet = 1;
var numberSet = 0;

function buildDataSet(data) {
	var output, years;

	years = new Array();
	output = {}
	output.years = new Array();

	jQuery.each(data.rows, function(i, item) {
		if (item.doc.sort != -1) {
			if (years[item.doc.year] == undefined) {
				years[item.doc.year] = new Array();
			}

			years[item.doc.year].push(item.doc);
		}
	});

	for (key in years) {
		var y = {};
		y.name = key;
		y.photos = new Array();

		jQuery.each(years[key], function(i, item) {
			y.photos.push(item);
		});

		y.photos.sort(function(a,b) { return parseInt(a.sort) - parseInt(b.sort) } );

		output.years.push(y);
	}

	output.years.sort(function(a,b) { return parseInt(b.name) - parseInt(a.name)  } );

	listEvents(output);
}

function listEvents(data) {
	var html = '';
	$.each(data.years, function(i,item) {
		html = html + '<h1><a name="'+item.name+'"></a>'+item.name+'</h1>\n';
		html = html + '<ul>\n';

		$.each(item.photos, function(j,jtem) {
			html = html + '<li class="event_listing">\n';
			html = html + '<a href="'+jtem.listurl+'" alt="'+jtem.listtitle+'"><img src="'+jtem.photo+'" alt="'+jtem.listtitle+'" /></a>\n';
			html = html + '<span class="desc"><a href="'+jtem.listurl+'" alt="'+jtem.listtitle+'">'+jtem.listtitle+'</a></span>\n';
		});

		html = html + '</ul>\n';
	});

	jQuery('#wrapper').prepend(html);
}

$(document).ready(function() {
	jQuery.ajax({
          url: 'http://events.deadlypenguin.com/_all_docs?include_docs=true',
          dataType: 'jsonp',
          success: buildDataSet
	});
});