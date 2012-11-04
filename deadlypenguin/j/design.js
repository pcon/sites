var currentSet = 1;
var numberSet = 0;

function buildDataSet(data) {
	var html = '';
	jQuery.each(data.rows, function(i,doc) {
		var item = doc.value;
		item.id = doc.id;

		html = html + '<a rel="lightbox['+item.id+']" href="'+item.screenshot+'">';
		html = html + '<img src="'+item.card+'" class="card" />';
		html = html + '</a>';

		jQuery.each(item.images, function(j, image) {
			html = html + '<a rel="lightbox['+item.id+']" href="'+image.url+'" title="'+image.desc+'" ></a>';
		});
	});

	jQuery('#wrapper').prepend(html);
};

$(document).ready(function() {
	jQuery.ajax({
		url: 'http://design.deadlypenguin.com/_design/sites/_view/design/',
		dataType: 'jsonp',                                                                                                                 
		success: buildDataSet
	});
});