//import * as d3 from "./libraries/d3/d3";

var margin = { top: 20, right: 20, bottom: 50, left: 70 },
    width = 1400 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var gridlines = true;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x 
var xValue = function (d) { return d.x; }, // data -> value
    xScale = d3.scaleLinear().range([0, width]), // value -> display
    xMap = function (d) { return xScale(xValue(d)); }, // data -> display
    xAxis = d3.axisBottom(xScale);

// setup y
var yValue = function (d) { return d.y; }, // data -> value
    yScale = d3.scaleLinear().range([height, 0]), // value -> display
    yMap = function (d) { return yScale((yValue(d))); }, // data -> display
    yAxis = d3.axisLeft(yScale).ticks(10);

// add the graph canvas to the body of the webpage
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var extensionCode = "mzspec:MOTIFDB:motif:171163";
const baseURL = "https://metabolomics-usi.ucsd.edu/"
const qrPrefix = "https://api.qrserver.com/v1/create-qr-code/?data="
const corsPrefix = "https://cors-anywhere.herokuapp.com/"
var qrX = 150;
qrY = 150;
const qrSuffix = "&amp;size=" + qrX + "x" + qrY

var qrCode = qrPrefix + baseURL + "qrcode/?usi=" + extensionCode + qrSuffix;
var dataUrl = baseURL + "csv/?usi=" + extensionCode;

function updateQrUrl() {
    qrCode =  qrPrefix + baseURL + "qrcode/?usi=" + extensionCode + qrSuffix;
}
function updateDataUrl() {
    dataUrl = baseURL + "csv/?usi=" + extensionCode;
}

function clearPlot() {
    d3.selectAll("g > *").remove();
}

// gridlines in x axis function
function make_x_gridlines() {
    return d3.axisBottom(xScale).ticks(10);
}

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisLeft(yScale).ticks(10);
}

var peakArray = []

function  configureData(entry) {
    peakArray.push( {"x": entry[0], "y":entry[1]} ) ; 
  }

function getData(input) {
    switch (typeof (input)) {
        case "object":
            //input.precursor_mz
            input.peaks.forEach(configureData);
            createPlot(peakArray);
            break;

        case "string":
            var filetype = input.split('.').pop();
            if (filetype == "csv") {

                d3.csv(input)
                .then(function (data) {
                    peakArray = data;
                    createPlot(data);
                })
                .catch(function (error) {
                    console.log(error);
                });

            } else if (filetype == "json"){
                
                d3.json(input)
                .then(function (data) {
                    getData(data);
                })
                .catch(function (error) {
                    console.log(error);
                });
            }
            break;

        default:
            console.log("Error in getting data")
    }
}

function createPlot(data) {

    var maxY = d3.max(data, yValue)
    var normalise = d3.scaleLinear().domain([0, maxY]).range([0, 1]);
    data.forEach(function (d) {
        d.y = normalise(d.y);
    })

    xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
    yScale.domain([0, d3.max(data, yValue)]);

    console.log(data);
    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis.ticks(20));

    // text label for the x axis
    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("m/z");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis.ticks(20, "%"));

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Intensity %");

    // peaks
    svg.selectAll("bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", xMap)
        .attr("width", 2)
        .attr("y", yMap)
        .attr("height", function (d) { return height - yScale(d.y); })
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(xValue(d))
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function (d) {
            d3.select(this).style("fill", "red");
        });

    // QR code
    svg.append('image')
        .attr('xlink:href', qrCode)
        .attr("id", "qr")
        .attr('width', 150)
        .attr('height', 150)
        .attr('x', width - 300)
        .attr('y', height - 600);

}

function clearSelections() {
    clearPlot();
    createPlot(peakArray);
}

function updateCode() {
    extensionCode = document.getElementById("libCode").value;
    console.log("New extension code: " + extensionCode);
    clearPlot();
    getData()

}

function toggleGrid() {
    var grid = d3.selectAll(".grid");

    if (grid.empty()) { // grid exists then remove
        createGrid();
        d3.selectAll(".grid").lower();
    } else {
        grid.remove();
    }
}

function createGrid() {
    // add the X gridlines
    svg.append("g")
        .attr("class", "grid")
        .attr("id", "xGrid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        );

    // add the Y gridlines
    svg.append("g")
        .attr("class", "grid")
        .attr("id", "yGrid")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        );
}

function toggleQR() {
    var active = qr.active ? false : true,
        newOpacity = active ? 0 : 1;
    // Hide or show the elements
    d3.select("#qr").style("opacity", newOpacity);
    // Update whether or not the elements are active
    qr.active = active;
}

function init() {
    getData("peaks.json");
}

init();