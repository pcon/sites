jq = jQuery.noConflict();

var items = new Array();
var presets = new Array();
var itemsPopulated = false;
var presetsPopulated = false;

function getQuantity(num) {
	var item = items[num];
	var quantity = Number(item.quantity);
	var days = jq('#days').val();

	if (item.perday) {
		quantity = quantity * Number(days);
	}

	if (item.additional != undefined) {
		quantity = quantity + Number(item.additional);
	}

	return quantity;
}

function updateQuantity(id, quantity) {
	jq('#list-'+id+' .quant').html(quantity);
}

function addPreset(num) {
	jq('#preset-'+num).fadeOut();

	var preset = presets[num];
	jq.each(preset.items, function(key, val) {
		moveItem(val);
	});
}

function moveItem(num) {
	jq('#item-'+num).fadeOut();

	var item = items[num];
	var quantity = getQuantity(num);

	var newList = '<li id="list-'+num+'" class="item ui-state-highlight">'+
		'<span class="name">'+item.name+'</span>'+
		'<span class="ui-icon ui-icon-close">Remove</span>'+
		'<span class="ui-icon ui-icon-wrench">Edit</span>'+
		'<span class="quant">'+quantity+'</span></li>';
	jq('#list').append(newList);

	jq('#list-'+num+' .ui-icon-close').click(closeClick);
	jq('#list-'+num+' .ui-icon-wrench').click(editClick);
}

function addItem(item) {
	jq('#items-'+item.category).append('<li id="item-'+item.id+'" class="item droppable ui-state-highlight"><div class="item-text grippy">'+item.name+'</div></li>');
}

function addCategory(cat) {
	jq('#itemsWrapper').append('<h4 class="ui-widget-header">'+cat.name+'</h5>');
	jq('#itemsWrapper').append('<ul id="items-'+cat.id+'" class="items"></ul>');
}

function onDrop(event, ui) {
	var item = ui.draggable[0];
	if (item.id.indexOf('item-') != -1) {
		moveItem(item.id.replace('item-', ''));
	} else if (item.id.indexOf('preset-') != -1) {
		addPreset(item.id.replace('preset-', ''));
	}
}

function populateCategories(data) {
	jq.each(data, function(key, val) {
		jq.each(val, function(key2, val2) {
			addCategory(val2);
		});
	});
	jq.getJSON('/json/apps/items.json', populateItems);
}

function populateItems(data) {
	jq.each(data, function(key, val) {
		jq.each(val, function(key2, val2) {
			items[val2.id] = val2;
			addItem(val2);
		});
	});

	itemsPopulated = true;

	if (itemsPopulated && presetsPopulated) {
		jQueryUIstuff();
	}
}

function populatePresets(data) {
	jq.each(data, function(key, val) {
		jq.each(val, function(key2, val2) {
			presets[val2.id] = val2;
			jq('#presets').append('<li id="preset-'+val2.id+'" class="droppable ui-state-highlight">'+val2.name+'</li>');
		});
	});

	presetsPopulated = true;

	if (itemsPopulated && presetsPopulated) {
		jQueryUIstuff();
	}
}

function onSliderChange(event, ui) {
	jq('#days').val(ui.value);
	jq('#list li').each(function(key, val) {
		var quantity = getQuantity(val.id.replace('list-', ''));
		updateQuantity(val.id, quantity);
	});
}

function jQueryUIstuff() {
	jq('.droppable').draggable({revert: "invalid"});
	jq('#content').droppable({
		drop: onDrop
	});

	jq('#slider-range-max').slider({range: "max", min: 1, max: 10, value: 2, slide: onSliderChange});
	jq('#slider-range-max').val(jq('#slider-range-max').slider("value"));

	jq('#content').resizable({maxHeight: 700, maxWidth: 800, minHeight: 200, minWidth: 700});
	jq('#list').sortable();
	jq('#list').disableSelection();
}

function editClick() {
	var id = jq(this).parent()[0].id.replace('list-','');
	var item = items[id];
	var h = 300;

	jq('#edit-item input[name="quantity"]').val(item.quantity);
	if (item.perday) {
		h = 350;
		showAdditional();
		jq('#edit-item input[name="perday"]').attr('checked', true);
		jq('#edit-item input[name="additional"]').val(item.additional);
	}

	jq('#edit-item').dialog({
		modal: true,
		height: h,
		width: 350,
		buttons: {
			Ok: function() {
				item.quantity = jq('#edit-item input[name="quantity"]').val();
				if (jq('#edit-item input[name="perday"]').is(':checked')) {
					item.perday = true;
					item.additional = jq('#edit-item input[name="additional"]').val();
				} else {
					item.perday = false;
					item.additional = null;
				}

				updateQuantity(id, getQuantity(id));

				hideAdditional();
				jq(this).dialog('close');
			},
			Cancel: function() {
				hideAdditional();
				jq(this).dialog('close');
			}
		}
	});
}

function closeClick() {
	jq(this).parent().fadeOut();
	var id = jq(this).parent()[0].id.replace('list-','');
//	addItem(items[id]);
	jq('#item-'+id).attr('style', 'position: relative;');

	jq('.droppable').draggable({revert: "invalid"});
	jq('#content').droppable({
		drop: onDrop
	});
}

function hideAdditional() {
	jq('label[for="additional"]').addClass('hidden');
	jq('#additional').addClass('hidden');
	jq('#edit-item').dialog({height: 300});
}

function showAdditional() {
	jq('label[for="additional"]').removeClass('hidden');
	jq('#additional').removeClass('hidden');
	jq('#edit-item').dialog({height: 350});
}

jq(document).ready(function() {
	jq('#perday').change(function() {
		if (jq(this).is(':checked')) {
			showAdditional();
		} else {
			hideAdditional();
		}
	});

	jq('#printable').click(function() {
		if (jq('link[name="print"]').length) {
			jq('link[name="print"]').remove();
			jq('#content').resizable({disabled: false});
		} else {
			jq('head').append('<link rel="stylesheet" type="text/css" name="print" href="/s/apps/packinglistprint.css" />');
			jq('#content').resizable({disabled: true});
		}
	});

	jq.getJSON('/json/apps/categories.json', populateCategories);
	jq.getJSON('/json/apps/presets.json', populatePresets);
});
