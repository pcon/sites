var currentSet = 1;
var numberSet = 0;

$(document).ready(function() {
	jQuery.getJSON('http://www.deadlypenguin.com/json/static.json', function(data) {
		var html;

		leftArrow = data.leftArrow;
		rightArrow = data.rightArrow;
		penguin = data.logo;

		jQuery('#footer').prepend(html);
	});

	var request = jQuery.ajax({
          url: 'http://people.deadlypenguin.com/root/',
          dataType: 'jsonp',
          success: function(data) {
			var html = '';
			$.each(data.photos, function(i,item){

				if (i % 3 == 0) {
					numberSet++;

					html = html + '<div id="page'+numberSet+'" class="page">\n';
				}

				var mod = (i % 3) + 1;

				html = html + '<div class="photo shadow photo'+mod+'" id="'+item.id+'">\n';
				html = html + '<div class="person"><a href="'+item.url+'"><img alt="'+item.name+'" src="'+item.photo+'" /></a></div>\n';
				html = html + '<div class="photoLabel"><a href="'+item.url+'"><img src="'+item.label+'" alt="'+item.name+'" /></a></div>\n';
				html = html + '</div>\n';

				if ((i+1) % 3 == 0) {
					html = html + '</div><!-- end page -->\n';
				}

			});

			if (!html.match(/<!-- end page -->\n$/)) {
				html = html + '</div>';
			}
			
			jQuery('#wrapper').prepend(html);

			if(numberSet > 1) {
				jQuery('#nextPage').removeClass('hidden');
			}
			jQuery('#page1').removeClass('hidden');
		}
	});
});

function nextPage() {
	jQuery('#page'+currentSet).addClass('hidden');
	jQuery('#page'+(currentSet+1)).removeClass('hidden');
	jQuery('#prevPage').removeClass('hidden');
	currentSet++;

	if (currentSet == numberSet) {
		jQuery('#nextPage').addClass('hidden');
	}
}

function prevPage() {
	jQuery('#page'+currentSet).addClass('hidden');
	jQuery('#page'+(currentSet-1)).removeClass('hidden');
	jQuery('#nextPage').removeClass('hidden');
	currentSet--;

	if (currentSet == 1) {
		jQuery('#prevPage').addClass('hidden');
	}
}