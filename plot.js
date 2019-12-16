import * as d3 from "./libraries/d3/d3";

var margin = { top: 20, right: 20, bottom: 30, left: 40 },
    width = 1400 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

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
    yMap = function (d) { return yScale(yValue(d)); }, // data -> display
    yAxis = d3.axisLeft(yScale);

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
// load data

function clearPlot() {
    d3.selectAll("svg > *").remove();
}

function updatePlot() {
    var qrCode = baseURL + "qrcode/?usi=" + extensionCode;
    var dataUrl = baseURL + "csv/?usi=" + extensionCode;
    
    d3.csv("peaks.csv")
        .then(function(data) {
            xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
            yScale.domain([0, d3.max(data, function (d) { return d.y; })]);
    
            // x-axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("class", "label")
                .attr("x", width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .text("m/z");
    
            // y-axis
            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Intensity %");
    
            // peaks
            // svg.selectAll("bar").remove();
            svg.selectAll("bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .style("fill", "steelblue")
                .attr("x", xMap)
                .attr("width", 1.5)
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
                // .on("click", function (d) {
                //     // Determine if current line is visible
                //     tooltip.transition()
                //     .duration(500)
                //     .style("opacity", 1);
                //     tooltip.html(xValue(d))
                //     .style("left", (d3.event.pageX + 5) + "px")
                //     .style("top", (d3.event.pageY - 28) + "px");
    
                // });
    
            // QR code
            svg.append('image')
                .attr('xlink:href', qrCode)
                .attr("id", "qr")
                .attr('width', 220)
                .attr('height', 250)
                .attr('x', width - 300)
                .attr('y', height - 650);

        })
        .catch(function(error){
            console.log(error);
            //handle error
        });
}


function updateCode() {
    extensionCode = document.getElementById("libCode").value;
    console.log("New extension code: " + extensionCode);
    
    updatePlot();
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
    updatePlot();
}

init();