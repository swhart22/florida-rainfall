
var width = parseInt(d3.select('#container').style('width'));
var height = parseInt(d3.select('#container').style('height'));


var colorScale = [{'dark':'#D8472A', 'lite':'#f3d0ca'}, {'dark':'#53A9DC', 'lite':'#d2e8f5'}, {'dark':'#91BC7F', 'lite':'#E2EDDE'}, {'dark':'#6A4177', 'lite':'#DACFDD'}, {'dark':'#EEC535', 'lite':'#FAF0CD'},{'dark':'#000000', 'lite':'#DBDBDA'}];



d3.csv('data/output/output.csv', function(error, totals){
	if (error) throw error;
	d3.json('data/states.json',function(error, baselines){	
		if (error) throw error;
		d3.json('data/urbans.json',function(error,urbans){

	
	var canvas = d3.select('#container')
		.append('svg')
		.attr('id','canvas')
		.attr('width',width)
		.attr('height',height);
	
	var actualCanvas = d3.select('#container')
		.append('canvas')
		.attr('width',width)
		.attr('height',height);

	var labelsCanvas = d3.select('#container')
		.append('svg')
		.attr('width',width)
		.attr('height',height);

	var context = actualCanvas.node().getContext('2d');
		
	var projection = d3.geoTransverseMercator()
  		.rotate([82, -24 - 20 / 60])
		.fitSize([width, height], { 
	      		"type": "LineString", "coordinates": [[+d3.min(totals, function(d){return d.Lon}), +d3.min(totals, function(d){return d.Lat})], [+d3.max(totals, function(d){return d.Lon}), +d3.max(totals, function(d){return d.Lat})]]
	    	});

	var path = d3.geoPath()
		.projection(projection);

	var cities = [
		{'city':'Miami','lat':25.7617,'lon':-80.1918, 'pop':453579},
		{'city':'Tampa','lat':27.9506,'lon':-82.4572, 'pop':377165},
		{'city':'Jacksonville','lat':30.3322,'lon':-81.6557, 'pop':880619},
		{'city':'Orlando','lat':28.5383,'lon':-81.3792,'pop':277173},
		{'city':'Tallahassee', 'lat':30.4383, 'lon':-84.2807,'pop':190894},
		{'city':'Atlanta','lat':33.7490, 'lon':-84.3880, 'pop':472522},
		{'city':'Savannah','lat':32.0835, 'lon':-81.0998, 'pop':146763},
		{'city':'Key West','lat':24.5551, 'lon':-81.7800, 'pop':26990},
		{'city':'Charleston', 'lat':32.7765, 'lon':-79.9311, 'pop':134385}
	]

	console.log(cities);

	var paths = canvas.selectAll('.state-lines')
		.data(baselines.features)
		.enter()
		.append('path')
		.attr('class','state-lines')
		.attr('d',path)
		.style('stroke','#C0C0C0')
		.style('fill','#F7F7F7');

	var urbanpaths = canvas.selectAll('.urbans')
		.data(urbans.features)
		.enter()
		.append('path')
		.attr('class','urbans')
		.attr('d',path)
		.style('stroke','#C0C0C0')
		.style('fill','#C0C0C0')
		.style('opacity',.7);


	var buttons = totals.columns.slice(5).map(function(stamp){return stamp;})

	console.log(buttons);

	var parser = d3.timeParse("%Y%m%d%H");

	var timer = d3.select('#container').append('div')
		.attr('id','timer')
		.style('position','absolute');	

	var day = timer
		.append('div')
		.attr('id','timer-day');

	var hour = timer
		.append('div')
		.attr('id','timer-hour');
	
	buttons = buttons.sort((a,b) =>{
		return parser('201709' + a) - parser('201709' + b)
	})
	
	console.log(buttons);
	var maxArray = [];
	
	buttons.forEach(b => {
		
		var maxCol = d3.max(totals, function(d){return d[b];})
		
		maxArray.push(maxCol)

	})
	
	var max = d3.max(maxArray);
	
	var scale = d3.scaleLinear()
		.domain([0, max])
		.range([1,12]);

	var colorRange = d3.scaleLinear()
		.domain([0, max])
		.range([colorScale[1].dark, colorScale[2].dark]);

	totals.forEach(d => {
		context.beginPath();
		var [x,y] = projection([d.Lon, d.Lat])
		function radius(d){
			if (d['1000'] == 0){return 0;}
			else {return scale(d['1000']);}
		}

		context.arc(x, y, radius(d), 0, 2*Math.PI)
		context.fillStyle = colorRange(d['1000'])
		context.fill()
	})

	var cityCircles = labelsCanvas.selectAll('.cities')
		.data(cities)
		.enter()
		.append('circle')
		.attr('class','cities')
		.attr('cx',function(d){return projection([d.lon, d.lat])[0];})
		.attr('cy',function(d){return projection([d.lon, d.lat])[1]})
		.style('r',2)
		.style('fill','#000');

	var cityLabels = labelsCanvas.selectAll('.city-labels')
		.data(cities)
		.enter()
		.append('text')
		.attr('class','city-labels')
		.attr('x',function(d){return projection([d.lon, d.lat])[0] + 5;})
		.attr('y',function(d){return projection([d.lon, d.lat])[1]})
		.text(function(d){return d.city;});

	var cityTotals = [
		{'city':'Key West','closestLat':24.5539,'closestLon':-81.8155},
		{'city':'Miami','closestLat':25.7184,'closestLon':-80.1751},
		{'city':'Tampa','closestLat':27.9399,'closestLon':-82.5078},
		{'city':'Orlando','closestLat':28.5016,'closestLon':-81.3607},
		{'city':'Jacksonville','closestLat':30.2819,'closestLon':-81.6282},
		{'city':'Charleston','closestLat':32.7345, 'closestLon':-79.9298}
	]
	cityTotals.forEach(d =>{

		totals.forEach(e =>{
			if (d['closestLat'] == e['Lat'] && d['closestLon'] == e['Lon']){
				var cumulative = 0
				buttons.forEach((f,i)=>{
					d[f] = e[f]

					cumulative += +d[f]
					d[f + 'total'] = cumulative
				})
			}
		})

	})
	
	var barWidth = 10;
	var barPadding = 5;
	var barMax = 180;
	var maxCities = [];
	buttons.forEach(b => {
		
		var maxCity = d3.max(cityTotals, function(d){return d[b + 'total'];})
		
		maxCities.push(maxCity)

	})
	var barScale = d3.scaleLinear()
		.domain([0,d3.max(maxCities)])
		.rangeRound([0,barMax]);

	var bars = labelsCanvas.selectAll('.bar')
		.data(cityTotals)
		.enter()
		.append('rect')
		.attr('class','.bar')
		.style('x', 100)
		.style('y', function(d,i){return height - (barWidth * cityTotals.length) -15 - (i * (barWidth + barPadding))})
		.style('width',function(d){
			return barScale(d['1000'])
		})
		.style('height',barWidth)
		.style('fill',colorScale[0].lite);

	var smallBars = labelsCanvas.selectAll('.smallbar')
		.data(cityTotals)
		.enter()
		.append('rect')
		.attr('class','smallbar')
		.style('x', 100)
		.style("y",function(d,i){return height - (barWidth * cityTotals.length) -15 - (i * (barWidth + barPadding )- 2.5)})
		.style('width', function(d){
			return barScale(d['1000'])
		})
		.style('height', 5)
		.style('fill',colorScale[1].dark);

	var barLabels = labelsCanvas.selectAll('.bar-labels')
		.data(cityTotals)
		.enter()
		.append('text')
		.attr('class','bar-labels')
		.attr('x',95)
		.attr('y',function(d,i){return height - (barWidth * cityTotals.length)-15 - (i * (barWidth + barPadding)) + 9 })
		.attr('text-anchor','end')
		.text(function(d){return d['city'];});

	var barTotals = labelsCanvas.selectAll('.bar-totals')
		.data(cityTotals)
		.enter()
		.append('text')
		.attr('class','bar-totals')
		.attr('x',function(d){return 100 + barScale(d['1000']) + 5})
		.attr('y',function(d,i){return height - (barWidth * cityTotals.length)-15 - (i * (barWidth + barPadding)) + 9 })
		.text(function(d){return d3.format('.3n')(d['1000total'])+ ' in';});

	var legendBar1 = labelsCanvas.append('rect')
		.style('x', 90)
		.style('y', height - 50)
		.style('width',5)
		.style('height',5)
		.style('fill',colorScale[0].lite);

	var legendBar2 = labelsCanvas.append('rect')
		.style('x', 90)
		.style('y', height - 35)
		.style('width',5)
		.style('height',5)
		.style('fill',colorScale[1].dark);

	var legendLabel1 = labelsCanvas.append('text')
		.attr('x', 100)
		.attr('y', height - 50 + 6)
		.attr('class','legend-label')
		.text('Cumulative rainfall');

	var legendLabel2 = labelsCanvas.append('text')
		.attr('x', 100)
		.attr('y', height - 35 +6 )
		.attr('class','legend-label')
		.text('Hourly rainfall');

	var counter = 0;
	d3.interval(function(){
		
		draw(buttons[counter++ % buttons.length])

	}, 600);
	function draw(time){
		context.clearRect(0,0,width,height)
		totals.forEach(d => {
			context.beginPath();
			var [x,y] = projection([d.Lon, d.Lat])
			function radius(d){
				if (d[time] == 0){return 0;}
				else {return scale(d[time]);}
			}

			context.arc(x, y, radius(d), 0, 2*Math.PI)
			context.fillStyle = colorRange(d[time])
			context.fill()
		})

		day
			.text(d3.timeFormat('%A')(parser('201709' + time)));

		hour
			.text(d3.timeFormat('%I:00 %p')(parser('201709' + time)));

		bars
			.style('width', function(d,i){ 
				return barScale(d[time + 'total']);
			})

		smallBars
			.style('width',function(d,i){
				return barScale(d[time]);
			})

		barTotals
			.attr('x',function(d){return 100 + barScale(d[time+'total']) + 5})
			.text(function(d){return d3.format('.2n')(d[time+'total']) + ' in';})


	}
	
	d3.select(window)
		.on('resize',redraw);

	function redraw(){
		var width = parseInt(d3.select('#container').style('width'));

		var height = parseInt(d3.select('#container').style('height'));
		if (width < 970){
			canvas
				.attr("width",width)
				.attr('height',height);

			actualCanvas
				.attr('width',width)
				.attr('height',height);

			labelsCanvas
				.attr('width',width)
				.attr('height',height);

			projection
				.fitSize([width, height], { 
	      		"type": "LineString", "coordinates": [[+d3.min(totals, function(d){return d.Lon}), +d3.min(totals, function(d){return d.Lat})], [+d3.max(totals, function(d){return d.Lon}), +d3.max(totals, function(d){return d.Lat})]]
	    	})

			paths
				.attr('d',path);

			urbanpaths
				.attr('d',path);
			
			cityCircles
				.attr('cx',function(d){return projection([d.lon, d.lat])[0];})
				.attr('cy',function(d){return projection([d.lon, d.lat])[1]});

			cityLabels
				.attr('x',function(d){return projection([d.lon, d.lat])[0] + 5;})
				.attr('y',function(d){return projection([d.lon, d.lat])[1]});

			bars
				.style('y', function(d,i){return height - (barWidth * cityTotals.length) -15 - (i * (barWidth + barPadding))});

			smallBars
				.style("y",function(d,i){return height - (barWidth * cityTotals.length) -15 - (i * (barWidth + barPadding )- 2.5)});

			barLabels
				.attr('y',function(d,i){return height - (barWidth * cityTotals.length)-15 - (i * (barWidth + barPadding)) + 9 });

			barTotals
				.attr('y',function(d,i){return height - (barWidth * cityTotals.length)-15 - (i * (barWidth + barPadding)) + 9 });

			legendBar1
				.style('y', height - 50);

			legendBar2
				.style('y', height - 35);

			legendLabel1
				.attr('y', height - 50 + 6);

			legendLabel2
				.attr('y', height - 35 +6 );


			}
			else{
				canvas
				.attr("width",width)
				.attr('height',height);

				actualCanvas
					.attr('width',width)
					.attr('height',height);

				labelsCanvas
					.attr('width',width)
					.attr('height',height);

				projection
					.fitSize([width, height], { 
		      		"type": "LineString", "coordinates": [[+d3.min(totals, function(d){return d.Lon}), +d3.min(totals, function(d){return d.Lat})], [+d3.max(totals, function(d){return d.Lon}), +d3.max(totals, function(d){return d.Lat})]]
		    	})

				paths
					.attr('d',path);

				urbanpaths
					.attr('d',path);
				
				cityCircles
					.attr('cx',function(d){return projection([d.lon, d.lat])[0];})
					.attr('cy',function(d){return projection([d.lon, d.lat])[1]});

				cityLabels
					.attr('x',function(d){return projection([d.lon, d.lat])[0] + 5;})
					.attr('y',function(d){return projection([d.lon, d.lat])[1]});

				bars
					.style('y', function(d,i){return height - (barWidth * cityTotals.length) -15 - (i * (barWidth + barPadding))});

				smallBars
					.style("y",function(d,i){return height - (barWidth * cityTotals.length) -15 - (i * (barWidth + barPadding )- 2.5)});

				barLabels
					.attr('y',function(d,i){return height - (barWidth * cityTotals.length)-15 - (i * (barWidth + barPadding)) + 9 });

				barTotals
					.attr('y',function(d,i){return height - (barWidth * cityTotals.length)-15 - (i * (barWidth + barPadding)) + 9 });

				legendBar1
					.style('y', height - 50);

				legendBar2
					.style('y', height - 35);

				legendLabel1
					.attr('y', height - 50 + 6);

				legendLabel2
					.attr('y', height - 35 +6 );
				
			}
		}

		})
	})
})

