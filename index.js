d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json', function(err, data) {

    var coldest = d3.min(data.monthlyVariance, function(d) {
        return d.variance
    });
    var hottest = d3.max(data.monthlyVariance, function(d) {
        return d.variance
    });

    var generate = function(min, max, n) {
        var diff = (max - min) / (n - 1);
        var array = [];
        if (max >= min) {
            for (var i = min, j = 0; i <= max; i = i + diff) {
                array[j] = i;
                j++;
            }
        } else {
            for (var i = min, j = 0; i >= min; i = i + diff) {
                array[j] = i;
                j++;
            }
        }
        return array;
    }

    rangeColors = ["rgb(94, 79, 162)", "rgb(50, 136, 189)", "rgb(102, 194, 165)", "rgb(171, 221, 164)", "rgb(230, 245, 152)", "rgb(255, 255, 191)", "rgb(254, 224, 139)", "rgb(253, 174, 97)", "rgb(244, 109, 67)", "rgb(213, 62, 79)", "rgb(158, 1, 66)"];

    var color = d3.scaleQuantize().domain([coldest, hottest]).range(rangeColors);

    var date = new Date();

    var margin = {
            top: 20,
            right: 20,
            bottom: 80,
            left: 80
        },
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var startTime = new Date(date.getTime());
    startTime.setFullYear(data.monthlyVariance[0].year);
    var endTime = new Date(date.getTime());
    endTime.setFullYear(data.monthlyVariance[data.monthlyVariance.length - 1].year);

    var barHeight = height / 12;
    var y = d3.scaleLinear().domain([1, 13]).range([0, height]);
    var x = d3.scaleTime().domain([startTime, endTime]).range([0, width]);

    var barWidth = width / (endTime.getFullYear() - startTime.getFullYear() + 1);

    var chart = d3.select("#chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("#tooltip")
        .style("visibility", "hidden")
        .style("height", 0);

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    chart.selectAll('rect')
        .data(data.monthlyVariance)
        .enter().append("rect")
        .attr("x", function(d) {
            var newDate = new Date(date.getTime());
            newDate.setYear(d.year);
            return x(newDate);
        })
        .attr("y", function(d) {
            return y(d.month);
        })
        .attr("width", barWidth)
        .attr("height", barHeight)
        .attr("fill", function(d) {
            return color(d.variance);
        })
        .on("mouseover", function(d) {
            tooltip.select("#time #month").text(months[d.month - 1]);
            tooltip.select("#time #year").text(d.year);
            tooltip.select("#temp").text(Math.round((+(d.variance) + +(data.baseTemperature)) * 1000) / 1000);
            tooltip.select("#variance").text(d.variance);
            tooltip.style("visibility", "visible")
            tooltip.style("height", "auto");
            return;
        })
        .on("mousemove", function(d) {
            return tooltip.style("top", (d3.event.pageY - 10) + "px")
                .style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.style("height", 0);
            return tooltip.style("visibility", "hidden");
        });

    var xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(15));

    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis);

    var yAxis = d3.axisLeft(y).tickFormat(function(d) {
        return months[d - 1];
    });

    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var yTicks = chart.selectAll(".y.axis g").each(function(data, i) {
        var tick = d3.select(this);
        tick.attr("transform", "translate(0, " + (i * barHeight + (barHeight / 2)) + ")");
        if (i > 11) {
            tick.remove();
        }
    });

    var colorBox = d3.select("#chart").append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height + 60) + ")");
    var colorBar = colorBox.selectAll("g").data(rangeColors)
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + i * 50 + ", 0)";
        })

    colorBar.append("rect")
        .attr("height", function(d) {
            return 10;
        })
        .attr("width", function(d) {
            return 50;
        })
        .attr("fill", function(d) {
            return d;
        });

    colorBar.append("text")
        .attr("x", function(d) {
            return 30;
        })
        .attr("y", function(d) {
            return 13;
        })
        .text(function(d) {
            var num = color.invertExtent(d)[1].toFixed(3);
            if (num > 0) {
                return "+" + num;
            }
            return num;
        })
        .attr("dy", ".75em")
        .attr("font-size", "0.7rem");

    d3.select("#chart").append("text")
        .text("Year")
        .attr("fill", "#000")
        .attr("font-weight", 900)
        .attr('transform', 'translate(' + (width / 2 + margin.left) + ',' + (height + 55) + ')');

    d3.select("#chart").append("text")
        .text("Month")
        .attr("fill", "#000")
        .attr("font-weight", 900)
        .attr('transform', 'translate(' + 25 + ',' + (height / 2 + margin.top + 10) + ') rotate(-90)');
});
