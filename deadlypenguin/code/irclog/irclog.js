var settingsUrl = 'http://pcon.cloudant.com/settings/irc';
var settings = undefined;

var row_template = '\
<tr class="__ROW_CLASS__">\
	<td>__NICK__</td>\
	<td>__TEXT__</td>\
	<td class="icon">\
		<a class="btn btn-link date-icon" data-toggle="tooltip" data-placement="left" title="__DATETIME__">\
			<i class="icon-time"></i>\
		</a>\
	</td>\
	<td class="icon">\
		<a class="btn btn-link" href="?id=__ID__&channel=__CHANNEL__">\
			<i class="icon-bookmark"></i>\
		</a>\
	</td>\
</tr>';

var nick_template = '\
<a href="#" class="nick"\
	data-toggle="popover"\
	data-placement="right"\
	data-html="true"\
	data-content="__PROFILE__"\
	title=""\
	data-original-title="__TITLE__">__NICK__</a>';

var title_template = "__NAME__ __TAGS__";
var profile_template = "<img class='popover-image' src='__AVATAR__' /><ul class='popover-list'><li><a href='__PROFILE_URL__'>Profile</a><li></ul>";
var tag_template = "<span class='label __TYPE__'>__TEXT__</span>";
var page_title_template = "IRC Logs (#__CHANNEL__)";

var loading_template = '<tr><td>Loading...</td></tr>';
var urlPattern = new RegExp("(http|ftp|https)://[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?")

Date.prototype.format=function(e){var t="";var n=Date.replaceChars;for(var r=0;r<e.length;r++){var i=e.charAt(r);if(r-1>=0&&e.charAt(r-1)=="\\"){t+=i}else if(n[i]){t+=n[i].call(this)}else if(i!="\\"){t+=i}}return t};Date.replaceChars={shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],longMonths:["January","February","March","April","May","June","July","August","September","October","November","December"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],longDays:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],d:function(){return(this.getDate()<10?"0":"")+this.getDate()},D:function(){return Date.replaceChars.shortDays[this.getDay()]},j:function(){return this.getDate()},l:function(){return Date.replaceChars.longDays[this.getDay()]},N:function(){return this.getDay()+1},S:function(){return this.getDate()%10==1&&this.getDate()!=11?"st":this.getDate()%10==2&&this.getDate()!=12?"nd":this.getDate()%10==3&&this.getDate()!=13?"rd":"th"},w:function(){return this.getDay()},z:function(){var e=new Date(this.getFullYear(),0,1);return Math.ceil((this-e)/864e5)},W:function(){var e=new Date(this.getFullYear(),0,1);return Math.ceil(((this-e)/864e5+e.getDay()+1)/7)},F:function(){return Date.replaceChars.longMonths[this.getMonth()]},m:function(){return(this.getMonth()<9?"0":"")+(this.getMonth()+1)},M:function(){return Date.replaceChars.shortMonths[this.getMonth()]},n:function(){return this.getMonth()+1},t:function(){var e=new Date;return(new Date(e.getFullYear(),e.getMonth(),0)).getDate()},L:function(){var e=this.getFullYear();return e%400==0||e%100!=0&&e%4==0},o:function(){var e=new Date(this.valueOf());e.setDate(e.getDate()-(this.getDay()+6)%7+3);return e.getFullYear()},Y:function(){return this.getFullYear()},y:function(){return(""+this.getFullYear()).substr(2)},a:function(){return this.getHours()<12?"am":"pm"},A:function(){return this.getHours()<12?"AM":"PM"},B:function(){return Math.floor(((this.getUTCHours()+1)%24+this.getUTCMinutes()/60+this.getUTCSeconds()/3600)*1e3/24)},g:function(){return this.getHours()%12||12},G:function(){return this.getHours()},h:function(){return((this.getHours()%12||12)<10?"0":"")+(this.getHours()%12||12)},H:function(){return(this.getHours()<10?"0":"")+this.getHours()},i:function(){return(this.getMinutes()<10?"0":"")+this.getMinutes()},s:function(){return(this.getSeconds()<10?"0":"")+this.getSeconds()},u:function(){var e=this.getMilliseconds();return(e<10?"00":e<100?"0":"")+e},e:function(){return"Not Yet Supported"},I:function(){var e=null;for(var t=0;t<12;++t){var n=new Date(this.getFullYear(),t,1);var r=n.getTimezoneOffset();if(e===null)e=r;else if(r<e){e=r;break}else if(r>e)break}return this.getTimezoneOffset()==e|0},O:function(){return(-this.getTimezoneOffset()<0?"-":"+")+(Math.abs(this.getTimezoneOffset()/60)<10?"0":"")+Math.abs(this.getTimezoneOffset()/60)+"00"},P:function(){return(-this.getTimezoneOffset()<0?"-":"+")+(Math.abs(this.getTimezoneOffset()/60)<10?"0":"")+Math.abs(this.getTimezoneOffset()/60)+":00"},T:function(){var e=this.getMonth();this.setMonth(0);var t=this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/,"$1");this.setMonth(e);return t},Z:function(){return-this.getTimezoneOffset()*60},c:function(){return this.format("Y-m-d\\TH:i:sP")},r:function(){return this.toString()},U:function(){return this.getTime()/1e3}}

var QueryString = function () {
	// This function is anonymous, is executed immediately and 
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
			// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	} 
	return query_string;
} ();

function escapeRegExp(str) {
	return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function replaceURLWithHTMLLinks(text) {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return text.replace(exp,"<a href='$1'>$1</a>"); 
}

function shortenLongURLs(text) {
	var exp = /[^'](\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	var matches = text.match(exp);
	var strLen = 100;

	if (matches != null) {
		for (var i = 0; i < matches.length; i++) {
			if (matches[i].length > strLen) {
				var oldString = matches[i];
				var newString = oldString.substring(0, strLen);
				newString += '...';
				text = text.replace(RegExp(escapeRegExp(oldString)), newString);
			}
		}
	}

	return text;
}

function getChannelUrl(channel) {
	return window.settings.base_url + '_design/channels/_view/' + channel + '/?startkey="' + window.settings.endDate + '"&endkey="' + window.settings.startDate + '"&descending=true';
}

function getFirstDateUrl(channel) {
	return window.settings.base_url + '_design/channels/_view/' + channel + '/?limit=1&descending=false';
}

function getIdUrl(channel, ids) {
	var keyString = ids.join();
	return window.settings.base_url + '_design/channels/_view/' + channel + '_by_id/?keys=[' + keyString + ']';
}

function getSearchUrl(term) {
	return window.settings.base_url + '_design/channels/_search/text?q='+term;
}

function getSettings() {
	jQuery.ajax({
		url: settingsUrl,
		dataType: 'jsonp',
		success: setSettings,
		async: false
	});
}

function setSettings(data) {
	window.settings = data;

	jQuery.ajax({
		url: window.settings.timesource,
		dataType: 'jsonp',
		success: getCurrentTime,
		async: false
	});
}

function setTimes(startDateString, endDateString) {
	var startDate_utc = null;
	var endDate_utc = null

	if (
		startDateString == null &&
		endDateString != null
	) {
		var endDate = new Date(endDateString);
		endDate_utc = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(),  endDate.getUTCHours(), endDate.getUTCMinutes(), endDate.getUTCSeconds());

		var startDate = new Date();
		var dayOffset = window.settings.base_timespan / 24;
		startDate.setDate(endDate.getDate() - dayOffset);

		startDate_utc = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(),  startDate.getUTCHours(), startDate.getUTCMinutes(), startDate.getUTCSeconds());
	} else if (
		startDateString != null &&
		endDateString == null
	) {
		var startDate = new Date(startDateString);
		startDate_utc = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(),  startDate.getUTCHours(), startDate.getUTCMinutes(), startDate.getUTCSeconds());

		var endDate = new Date();
		var dayOffset = window.settings.base_timespan / 24;
		endDate.setDate(startDate.getDate() + dayOffset);

		endDate_utc = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(),  endDate.getUTCHours(), endDate.getUTCMinutes(), endDate.getUTCSeconds());

	} else if (
		startDateString != null &&
		endDateString != null
	){
		var startDate = new Date(startDateString);
		startDate_utc = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(),  startDate.getUTCHours(), startDate.getUTCMinutes(), startDate.getUTCSeconds());

		var endDate = new Date(endDateString);
		endDate_utc = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(),  endDate.getUTCHours(), endDate.getUTCMinutes(), endDate.getUTCSeconds());
	} else {
		var endDate = new Date(window.settings.now);
		endDate_utc = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(),  endDate.getUTCHours(), endDate.getUTCMinutes(), endDate.getUTCSeconds());

		var startDate = new Date();
		var dayOffset = window.settings.base_timespan / 24;
		startDate.setDate(endDate.getDate() - dayOffset);

		startDate_utc = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(),  startDate.getUTCHours(), startDate.getUTCMinutes(), startDate.getUTCSeconds());
	}

	window.settings['endDate'] = endDate_utc.format("Y-m-d\\TH:i:s\\Z");
	window.settings['startDate'] = startDate_utc.format("Y-m-d\\TH:i:s\\Z");
}

function getCurrentTime(data) {
	var startDate = null;
	var endDate = null;

	window.settings['now'] = data.datetime;

	if (
		typeof QueryString.endDate !== 'undefined' &&
		QueryString.endDate
	) {
		endDate = QueryString.endDate;
	}

	if (
		typeof QueryString.startDate !== 'undefined' &&
		QueryString.startDate
	) {
		startDate = QueryString.startDate;
	}
	
	setTimes(startDate, endDate);

	getLogs();
}

function showResults(data) {
	var ids = new Array();

	jQuery.each(data.rows, function(key, value) {
		ids.push('"'+value.id+'"');
	});

	var url = getIdUrl(QueryString.channel, ids);

	jQuery.ajax({
		url: url,
		dataType: 'jsonp',
		success: printLogs
	});
}

function search(term) {
	var url = getSearchUrl(term);

	jQuery.ajax({
		url: url,
		dataType: 'jsonp',
		success: showResults,
	});
}

function getLogs() {
	if (typeof QueryString.channel !== 'undefined') {
		jQuery('#channel option').each(function() {
			if (jQuery(this).val() == QueryString.channel) {
				jQuery(this).attr('selected', 'selected');
			}
		});
	} else {
		QueryString['channel'] = jQuery('#channel :selected').val();
	}

	var channel = jQuery('#channel :selected').val();
	var url = getChannelUrl(channel);

	jQuery('#log-title').html(page_title_template.replace('__CHANNEL__', channel));

	if (
		typeof QueryString.search !== 'undefined' &&
		QueryString.search
	) {
		jQuery('#search-text').val(QueryString.search);
		search(QueryString.search);
	} else {
		if (
			typeof QueryString.id !== 'undefined' &&
			QueryString.id
		) {
			var ids = new Array();
			ids.push('"'+QueryString.id+'"');
			url = getIdUrl(QueryString.channel, ids);
		}

		jQuery.ajax({
			url: url,
			dataType: 'jsonp',
			success: printLogs
		});

		var now = new Date(window.settings.now);
		var startDate = new Date(window.settings.startDate);
		var endDate = new Date(window.settings.endDate);
		var firstLog = new Date(window.settings.firstLog);

		if (startDate > firstLog) {
			delete QueryString['startDate'];
			QueryString['endDate'] = window.settings.startDate;
			jQuery('.next').removeClass('disabled');
			jQuery('.next a').attr('href', getUrlWithQueryStrings());
			delete QueryString['endDate'];
		}

		if (endDate < now) {
			delete QueryString['endDate'];
			QueryString['startDate'] = window.settings.endDate;
			jQuery('.previous').removeClass('disabled');
			jQuery('.previous a').attr('href', getUrlWithQueryStrings());
			delete QueryString['startDate'];
		}
	}
}

function printLogs(data) {
	jQuery('#logs tbody').html('');

	jQuery.each(data.rows, function (key, value) {
		var log = value.value;
		var nickTxt = log.nick;
		var msgType = log.type;
		var nickType = 'human';
		var realNick = log.nick;

		var lowerNick = log.nick.toLowerCase();

		if (typeof window.settings.alias_map[lowerNick] !== 'undefined') {
			realNick = window.settings.alias_map[lowerNick];
		}

		var lowerReal = realNick.toLowerCase();

		if (jQuery.inArray(lowerReal, window.settings.bot_list) !== -1) {
			nickType = 'bot';
		}

		if (typeof window.settings.profile_map[lowerReal] !== 'undefined') {
			var profile = window.settings.profile_map[lowerReal];
			var tags = '';

			if (
				typeof window.settings.profile_map[lowerReal].regular &&
				window.settings.profile_map[lowerReal].regular
			) {
					tags += tag_template.replace('__TEXT__', 'regular').replace('__TYPE__', 'label-success');
			}

			if (
				typeof window.settings.profile_map[lowerReal].op &&
				window.settings.profile_map[lowerReal].op
			) {
					tags += tag_template.replace('__TEXT__', 'op').replace('__TYPE__', 'label-inverse');
			}

			if (
				typeof window.settings.profile_map[lowerReal].newb &&
				window.settings.profile_map[lowerReal].newb
			) {
					tags += tag_template.replace('__TEXT__', 'newb').replace('__TYPE__', 'label-warning');
			}

			var profileTxt = profile_template.replace('__AVATAR__', profile.avatar).replace('__PROFILE_URL__', profile.url).replace('__TAGS__', tags);
			var titleTxt = title_template.replace('__TAGS__', tags).replace('__NAME__', profile.name);
			nickTxt = nick_template.replace('__PROFILE__', profileTxt).replace('__NAME__', profile.name).replace('__TITLE__', titleTxt).replace('__NICK__', log.nick);
		}

		var rowStyle = msgType + ' ' + nickType;

		if (nickType === 'bot') {
			rowStyle += ' muted';
		}

		if (msgType === 'notice') {
			rowStyle += ' text-warning';
		}
		

		var formattedText = log.text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		formattedText = replaceURLWithHTMLLinks(formattedText);
		formattedText = shortenLongURLs(formattedText);

		if (
			typeof window.settings.substitute_map !== 'undefined' &&
			window.settings.substitute_map
		) {
			for(var key in window.settings.substitute_map) {
				formattedText = formattedText.replace(key, window.settings.substitute_map[key]);
			}
		}

		var row = '';

		if (msgType === 'emote') {
			formattedText = '<em>' + nickTxt + ' ' + formattedText + '</em>';
			row = row_template.replace('__NICK__', '<i class="icon-user"></i>').replace('__ROW_CLASS__', rowStyle).replace('__DATETIME__', log.date).replace('__ID__', log._id).replace('__CHANNEL__', QueryString.channel).replace('__TEXT__', formattedText);
		} else {
			row = row_template.replace('__NICK__', nickTxt).replace('__ROW_CLASS__', rowStyle).replace('__DATETIME__', log.date).replace('__ID__', log._id).replace('__CHANNEL__', QueryString.channel).replace('__TEXT__', formattedText);
		}

		jQuery('#logs tbody').append(row);
	});

	jQuery('a.nick').popover().on('click', function(e) {e.preventDefault(); return true;});
	jQuery('.date-icon').tooltip();
}

function channelChange() {
	var channel = jQuery('#channel :selected').val();
	var newUrl = document.URL.substr(0, document.URL.lastIndexOf('/')+1);
	newUrl += '?channel=' + channel;

	QueryString.channel = channel;

	if (
		typeof QueryString.search !== 'undefined' &&
		QueryString.search
	) {
		newUrl += '&search=' + QueryString.search;
	}

	window.history.pushState({}, "", newUrl);

	jQuery('#logs tbody').html(loading_template);

	getLogs();
}

function getUrlBase() {
	return document.URL.substr(0, document.URL.lastIndexOf('/')+1);
}

function getUrlWithQueryStrings() {
	var url = getUrlBase();
	var paramArray = new Array();

	for (var key in QueryString) {
		if (QueryString.hasOwnProperty(key)) {
			paramArray.push(key + '=' + QueryString[key]);
		}
	}

	url += '?' + paramArray.join('&');

	return url;
}

$(document).ready(function() {
	if (typeof QueryString.channel === 'undefined') {
		var channel = jQuery('#channel :selected').val();
		var newUrl = getUrlBase();
		newUrl += '?channel=' + channel;
		window.history.pushState({}, "", newUrl);
	}

	jQuery('#logs tbody').html(loading_template);
	getSettings();
	jQuery('#channel').change(channelChange);
});