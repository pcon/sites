<?php
	$page_title = urldecode($_GET["title"]);
	$setId = $_GET["setId"];
	$nsId = $_GET["nsId"];
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<head>
     <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
     <title>Nathan Connelly - <?php echo $page_title; ?></title>

     <link rel="stylesheet" type="text/css" href="/s/base.css" />
	<link rel="stylesheet" type="text/css" href="/s/galleriffic-2.css" />

	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
	<script type="text/javascript" src="/j/gallery.js"></script>
	<script type="text/javascript" src="/j/jquery.galleriffic.js"></script>
	<script type="text/javascript" src="/j/jquery.opacityrollover.js"></script>
</head>
<body>
     <div id="mainWrapper">
		<div id="images">
			<div id="gallery" class="content">
				<div id="controls" class="controls"></div>
				<div class="slideshow-container">
					<div id="loading" class="loader"></div>
					<div id="slideshow" class="slideshow"></div>
				</div>
			<div id="caption" class="caption-container"></div>
			</div>
			<div id="thumbs" class="navigation">
				<ul class="thumbs noscript" id="thumbList">
				</ul>
			</div>
		</div>
		<br class="clearboth" />
		<div id="back">
			<h3 class="centeredText"><a href="/" class="grayText">Home</a></h3>
		</div>
	</div>
	<script type="text/javascript">
		jQuery(document).ready(function($) {
			var setId = "<?php echo $setId; ?>";
			var nsId = "<?php echo $nsId; ?>";
			var APIkey = "6b11576331fc0406bbb316a06ae26061";
			generateGallery('http://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key='+APIkey+'&photoset_id='+setId+'&extras=media%2Curl_sq%2Curl_m&format=json&jsoncallback=?');
			//generateGallery('http://api.flickr.com/services/feeds/photoset.gne?set='+setId+'&nsid='+nsId+'&lang=en-us&format=json&jsoncallback=?');
		});	
	</script>
</body>
</html>