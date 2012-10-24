var currentSet = 1;
var numberSet = 0;

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

function buildDataSet(data) {
	var output;

	output = new Array();

	jQuery.each(data.rows, function(i, item) {
		if (item.doc.sort != -1) {
			output.push(item.doc);
		}
	});
	output.sort(function(a,b) { return parseInt(a.sort) - parseInt(b.sort)  } );

	listPeople(output);
}

function listPeopleMobile(people) {
	jQuery('#content').html('<ul data-role="listview" data-inset="true" data-filter="true">	<li><a href="#">Acura</a></li>	<li><a href="#">Audi</a></li>	<li><a href="#">BMW</a></li>	<li><a href="#">Cadillac</a></li>	<li><a href="#">Ferrari</a></li></ul>');
	jQuery('#content').trigger('create');
}

function listPeople(people) {
	var html = '';
	$.each(people, function(i,item) {
		var url = '/people/' + item._id.replace('-', '/') + '/';

		if (i % 3 == 0) {
			numberSet++;

			html = html + '<div id="page'+numberSet+'" class="page">\n';
		}

		var mod = (i % 3) + 1;

		html = html + '<div class="photo shadow photo'+mod+'" id="'+item._id+'">\n';
		html = html + '<div class="person"><a href="'+url+'"><img alt="'+item.name+'" src="'+item.photo+'" /></a></div>\n';
		html = html + '<div class="photoLabel"><a href="'+url+'"><img src="'+item.label+'" alt="'+item.name+'" /></a></div>\n';
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

$(document).ready(function() {
//	if (!isMobile.any()) {
		setupMobile();
//	} 

	jQuery.ajax({
		url: 'http://people.deadlypenguin.com/_all_docs?include_docs=true',
		dataType: 'jsonp',
		success: buildDataSet
	});
});

function setupMobile() {
	if (document.createStyleSheet) {
		document.createStyleSheet('http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.css');
	} else {
		jQuery('head').append("<link rel='stylesheet' href='http://code.jquery.com/mobile/1.2.0/jquery.mobile-1.2.0.min.css' type='text/css' media='screen' />");
	}

	jQuery('body').html('<div data-role="page"><div data-role="header"><h1>People</h1></div><div data-role="content" id="content"></div>');
}

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
