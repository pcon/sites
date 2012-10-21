$(function() {
	
	var totalPanels			= jQuery(".scrollContainer").children().size();
		
	var regWidth			= jQuery(".panel").css("width");
	var regImgWidth		= jQuery(".panel img").css("width");
	var regTitleSize		= jQuery(".panel h2").css("font-size");
	var regParSize			= jQuery(".panel p").css("font-size");
	
	var movingDistance	    = 300;
	
	var curWidth			= 350;
	var curImgWidth			= 326;
	var curTitleSize		= "20px";
	var curParSize			= "15px";

	var $panels				= jQuery('#slider .scrollContainer > div');
	var $container			= jQuery('#slider .scrollContainer');

	$panels.css({'float' : 'left','position' : 'relative'});
    
	jQuery("#slider").data("currentlyMoving", false);

	$container
		.css('width', ($panels[0].offsetWidth * $panels.length) + 100 )
		.css('left', "-350px");

	var scroll = jQuery('#slider .scroll').css('overflow', 'hidden');

	function returnToNormal(element) {
		jQuery(element)
			.animate({ width: regWidth })
			.find("img")
			.animate({ width: regImgWidth })
		    .end()
			.find("h2")
			.animate({ fontSize: regTitleSize })
			.end()
			.find("p")
			.animate({ fontSize: regParSize });
	};
	
	function growBigger(element) {
		jQuery(element)
			.animate({ width: curWidth })
			.find("img")
			.animate({ width: curImgWidth })
		    .end()
			.find("h2")
			.animate({ fontSize: curTitleSize })
			.end()
			.find("p")
			.animate({ fontSize: curParSize });
	}
	
	//direction true = right, false = left
	function change(direction) {
	   
	    //if not at the first or last panel
		if((direction && !(curPanel < totalPanels)) || (!direction && (curPanel <= 1))) { return false; }	
        
        //if not currently moving
        if ((jQuery("#slider").data("currentlyMoving") == false)) {
            
			jQuery("#slider").data("currentlyMoving", true);
			
			var next         = direction ? curPanel + 1 : curPanel - 1;
			var leftValue    = jQuery(".scrollContainer").css("left");
			var movement	 = direction ? parseFloat(leftValue, 10) - movingDistance : parseFloat(leftValue, 10) + movingDistance;
		
			jQuery(".scrollContainer")
				.stop()
				.animate({
					"left": movement
				}, function() {
					jQuery("#slider").data("currentlyMoving", false);
				});
			
			returnToNormal("#panel_"+curPanel);
			growBigger("#panel_"+next);
			
			curPanel = next;
			
			//remove all previous bound functions
			jQuery("#panel_"+(curPanel+1)).unbind();	
			
			//go forward
			jQuery("#panel_"+(curPanel+1)).click(function(){ change(true); });
			
            //remove all previous bound functions															
			jQuery("#panel_"+(curPanel-1)).unbind();
			
			//go back
			jQuery("#panel_"+(curPanel-1)).click(function(){ change(false); }); 
			
			//remove all previous bound functions
			jQuery("#panel_"+curPanel).unbind();
		}
	}
	
	// Set up "Current" panel and next and prev
	growBigger("#panel_3");	
	var curPanel = 3;
	
	jQuery("#panel_"+(curPanel+1)).click(function(){ change(true); });
	jQuery("#panel_"+(curPanel-1)).click(function(){ change(false); });
	
	//when the left/right arrows are clicked
	jQuery(".right").click(function(){ change(true); });	
	jQuery(".left").click(function(){ change(false); });
});
