var currentSet = 1;
var numberSet = 0;

$(document).ready(function() {
	jQuery.getJSON('http://www.deadlypenguin.com/json/static.json', function(data) {
		var html;

		penguin = data.logo;
	});

	jQuery.getJSON('http://www.deadlypenguin.com/json/design.json', function(data) {
		var html = '';
		jQuery.each(data.sites, function(i,item) {
			html = html + '<a rel="lightbox['+item.id+']" href="'+item.screenshot+'">';
			html = html + '<img src="'+item.card+'" class="card" />';
			html = html + '</a>';

			jQuery.each(item.images, function(j, image) {
				html = html + '<a rel="lightbox['+item.id+']" href="'+image.url+'" title="'+image.desc+'" ></a>';
			});
		});

		jQuery('#wrapper').prepend(html);
	});
});
