function generateGallery(url) {
	$.getJSON(url, putGalleryValues);
}

function putGalleryValues(data, textStatus, jqXHR) {
	$.each(data.photoset.photo, function(i, item) {
//		var thumbnail = item.media.m.substring(0, item.media.m.length - 6) + "_s.jpg";
//		var image = item.media.m.substring(0, item.media.m.length - 6) + ".jpg";
		var thumbnail = item.url_sq;
		var image = item.url_m;
		var html = '<li>'+
					'<a class="thumb" name="" href="'+image+'" title="'+item.title+'">' +
						'<img src="'+thumbnail+'" alt="'+item.title+'" />'+
					'</a>'+
					'<div class="caption">'+
						'<div class="image-title">'+item.title+'</div>'+
					'</div>'+
				'</li>'
				
		jQuery('#thumbList').append(html);
	});

	showGallery();
}

function showGallery() {
	// We only want these styles applied when javascript is enabled
	$('div.navigation').css({'width' : '300px', 'float' : 'left'});
	$('div.content').css('display', 'block');

	// Initially set opacity on thumbs and add
	// additional styling for hover effect on thumbs
	var onMouseOutOpacity = 0.67;
	var onMouseOutOpacity = 0.67;
	$('#thumbs ul.thumbs li').opacityrollover({
		mouseOutOpacity:   onMouseOutOpacity,
		mouseOverOpacity:  1.0,
		fadeSpeed:         'fast',
		exemptionSelector: '.selected'
	});
	
	// Initialize Advanced Galleriffic Gallery
	var gallery = $('#thumbs').galleriffic({
		delay:                     2500,
		numThumbs:                 15,
		preloadAhead:              10,
		enableTopPager:            true,
		enableBottomPager:         true,
		maxPagesToShow:            7,
		imageContainerSel:         '#slideshow',
		controlsContainerSel:      '#controls',
		captionContainerSel:       '#caption',
		loadingContainerSel:       '#loading',
		renderSSControls:          true,
		renderNavControls:         true,
		playLinkText:              'Play Slideshow',
		pauseLinkText:             'Pause Slideshow',
		prevLinkText:              '&lsaquo; Previous Photo',
		nextLinkText:              'Next Photo &rsaquo;',
		nextPageLinkText:          'Next &rsaquo;',
		prevPageLinkText:          '&lsaquo; Prev',
		enableHistory:             false,
		autoStart:                 false,
		syncTransitions:           true,
		defaultTransitionDuration: 900,
		onSlideChange:             function(prevIndex, nextIndex) {
			// 'this' refers to the gallery, which is an extension of $('#thumbs')
			this.find('ul.thumbs').children()
				.eq(prevIndex).fadeTo('fast', onMouseOutOpacity).end()
				.eq(nextIndex).fadeTo('fast', 1.0);
		},
		onPageTransitionOut:       function(callback) {
			this.fadeTo('fast', 0.0, callback);
		},
		onPageTransitionIn:        function() {
			this.fadeTo('fast', 1.0);
		}
	});
}
