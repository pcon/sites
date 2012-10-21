var backButton = 'http://lh4.ggpht.com/_rv96CE1pup8/TNWV7VfJP7I/AAAAAAAAC5o/zxeBY4KlfwQ/leftArrow.png';
var penguin = '';
var currentMap = 'MAP-world'

function showMap(id) {
	jQuery('.map').addClass('hidden');
	jQuery('#DIV-'+id).removeClass('hidden');
	currentMap = id;
}

function getMap() {
	var regexS = "[\\#&]([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if (results == null || results[1] == '') {
	} else {
		currentMap = 'MAP-' + results[1];
	}
}

$(document).ready(function() {
	var html = '';

	getMap();

	jQuery.getJSON('http://www.deadlypenguin.com/json/static.json', function(data) {
		penguin = data.logo;
	});



	jQuery.getJSON('http://www.deadlypenguin.com/json/places.json', function(data) {

		$.each(data.map, function(i,item) {
			html = html + '<div class="map hidden" id="DIV-'+item.id+'">';
			html = html + '<img src="'+item.url+'" alt="'+item.id+'" id="'+item.id+'" usemap="#'+item.id+'" />';

			if (item.id != "MAP-world") {
				html = html + '<a href="#" onClick="showMap(\'MAP-world\')"><img src="'+backButton+'" id="leftArrow" alt="leftArrow" /></a>';
			}
			html = html + '<map name="'+item.id+'">';

			$.each(item.areas, function(i,area) {
				if (!area.url.match(/^MAP/)) { 
					html = html + '<area id="'+area.id+'" shape="'+area.shape+'" style="" href="'+area.url+'" alt="'+area.name+'" coords="'+area.coords+'"></area>';
				} else {
					html = html + '<area id="'+area.id+'" shape="'+area.shape+'" style="" href="#'+area.id+'" onClick="showMap(\'MAP-'+area.id+'\');" alt="'+area.name+'" coords="'+area.coords+'"></area>';
				}
			});

			html = html + '</map></div>\n';
		});

		jQuery('#wrapper').append(html);
		showMap(currentMap);
	});
});

