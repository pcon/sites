var baseData = [
	1.7,  //0 - SUV
	1.2,  //1 - Car
	1.0,  //2 - Airplane
	0.6,  //3 - Prius
	0.4,  //4 - Carpool (per 3 riders)
	0.35, //5 - Transit Bus (per 50 riders)
	0.3   //6 - Rail (per 50 riders)
];
var labels = ['SUV', 'Car', 'Airplane', 'Prius', 'Carpool', 'Transit Bus', 'Rail'];
var riders = 1;

$(document).ready(function() {
	google.load('visualization', '1.0', {'packages':['corechart']});
	google.setOnLoadCallback(drawChart);

	$('#slider').slider({
		value: 1,
		min: 1,
		max: 50,
		step: 1,
		change: function(event, ui) {
			updateValues(ui.value);
		}
	});
});

function drawChart() {
	plotData(baseData, labels);
}

function plotData(dataSet, dataLabel) {
	console.log('data: '+dataSet[0]);
	var dataArray = [
		['Transporation', 'Amount'],
		[dataLabel[0], dataSet[0]],
		[dataLabel[1], dataSet[1]],
		[dataLabel[2], dataSet[2]],
		[dataLabel[3], dataSet[3]],
		[dataLabel[4], dataSet[4]],
		[dataLabel[5], dataSet[5]],
		[dataLabel[6], dataSet[6]]
	];

	var data = new google.visualization.arrayToDataTable(dataArray);
	var options = {
		title: "CO2 usage",
		vAxis: {
			title: "Transportation"
		}
	};

	var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
	chart.draw(data, options);
}

function updateValues(numberOfRiders) {
	riders = numberOfRiders;
	var data = new Array();

	console.log('BaseData: '+baseData[0]);

	data[0] = baseData[0] * riders;
	data[1] = baseData[1] * riders;
	data[2] = baseData[2] * riders;
	data[3] = baseData[3] * riders;
	data[4] = baseData[4] * ((riders/3) + 1);
	data[5] = baseData[5] * ((riders/50) + 1);
	data[6] = baseData[6] * ((riders/50) + 1);

	plotData(data, labels);
}