var page = 1;

function nextPage() {
	var nPage = page + 1;

	if (jQuery('#page'+nPage).length != 0) {
		jQuery('#prev img').removeClass('hidden');

		jQuery('#page'+page).addClass('hidden');
		jQuery('#page'+nPage).removeClass('hidden');
		page = nPage;

		nPage = page + 1;
		if (jQuery('#page'+nPage).length == 0) {
			jQuery('#next img').addClass('hidden');
		}

		location.href = "#page="+page;
	}
}

function prevPage() {
	var pPage = page - 1;

	if (pPage > 0 && jQuery('#page'+pPage).length != 0) {
		jQuery('#next img').removeClass('hidden');

		jQuery('#page'+page).addClass('hidden');
		jQuery('#page'+pPage).removeClass('hidden');
		page = pPage;

		if (page == 1) {
			jQuery('#prev img').addClass('hidden');
		}

		location.href = "#page="+page;
	}
}

function getParam(name) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\#&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );

	if( results == null ) {
		return "";
	} else {
		return results[1];
	}
}

$(document).ready(function() {
	if (getParam('page') != "") {
		page = parseFloat(getParam('page'));
	}

	if (jQuery('#page'+page).length != 0) {
		jQuery('#page1').addClass('hidden');
		jQuery('#page'+page).removeClass('hidden');

		if (page == 1) {
			jQuery('#prev img').addClass('hidden');
		}

		var nPage = page + 1;
		if (jQuery('#page'+nPage).length == 0) {
			jQuery('#next img').addClass('hidden');
		}
	} else  {
		jQuery('#prev img').addClass('hidden');
	}
});
