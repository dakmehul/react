import React, {Component} from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import map from "lodash/map";
import uniq from "lodash/uniq";
import minBy from "lodash/minBy";
import maxBy from "lodash/maxBy";
import max from 'lodash/max'
import "./heat-map.scss";

class HeatMap extends Component {

    constructor(props) {
        super(props);
        this.state = {
            height: null,
            width: null
        };
    }

    componentDidMount() {
        this.setHeightAndWidth();
    }

    stateUpdateCallback(state) {
        this.updateChart(this.props);
    }

    setHeightAndWidth() {
        let parentNode = ReactDOM.findDOMNode(this.refs.vizDiv);
        if (parentNode) {
            let vizHeight = parentNode.clientHeight;
            let vizWidth = parentNode.clientWidth;
            this.setState({height: vizHeight, width: vizWidth}, this.stateUpdateCallback);
        }
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillUnmount() {
        ReactDOM.unmountComponentAtNode(this.tooltipTarget);
    }

    componentWillReceiveProps(nextProps) {
        this.setHeightAndWidth();
    }

    handleTooltip(d) {
        if (this.props.tooltipComponent) {
            let tooltipComponent = this.props.tooltipComponent(0, d);
            ReactDOM.render(tooltipComponent, this.tooltipTarget);
        }
    }

    getSvgWidthAndHeight(data, gridSize, margin) {
        let BUFFER_WH_FACTOR = 500;
        let svgWidth = 0;
        let svgHeight = 0;
        let allXPos = map(data, function (s) {
            return s.xAxisPos;
        });
        let xAxisMax = max(allXPos);
        let allYPos = map(data, function (s) {
            return s.yAxisPos;
        });
        let yAxisMax = max(allYPos);
        let x = (xAxisMax - 1) * gridSize + margin;
        let height = (yAxisMax - 1) * gridSize + BUFFER_WH_FACTOR;
        let width = x + gridSize + BUFFER_WH_FACTOR;
        svgWidth = (width < this.state.width) ? this.state.width : width;
        svgHeight = (height < this.state.height) ? this.state.height : height;
        return {svgWidth, svgHeight};
    }

    updateChart(nextProps) {
        if (this.heatMapSvg) {
            this.heatMapSvg.selectAll("*").remove();
        }
        let heightFactor = nextProps.heightFactor;
        let widthFactor = nextProps.widthFactor;
        const gridSize = Math.floor(widthFactor / 24) * 2,
            legendElementWidth = gridSize,
            colors = nextProps.colors,
            START_MARGIN = 40;
        let svg = d3.select(this.svg);
        let data = nextProps.data;
        let svgWidthAndHeight = this.getSvgWidthAndHeight(data, gridSize, START_MARGIN);
        this.heatMapSvg = svg
            .attr("width", svgWidthAndHeight.svgWidth)
            .attr("height", svgWidthAndHeight.svgHeight)
            .attr("id", "heatMapSvg");
        let self = this;

        if (data.length <= 0) {
            return <div>No data available.</div>;
        }
        let xAxisLabels = map(data, "xAxisLabel");
        let uniqueXAxisLabels = uniq(xAxisLabels, true);
        let yAxisLabels = map(data, "yAxisLabel");
        let uniqueYAxisLabels = uniq(yAxisLabels, true);
        let numOfProd = uniqueYAxisLabels.length;
        let noDemandChangeValue = 0;

        let g = self.heatMapSvg.append("g")
            .attr("transform", "translate(" + nextProps.margins.left + "," + nextProps.margins.top + ")");

        g.selectAll(".xAxisLabel")
            .data(uniqueXAxisLabels)
            .enter().append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", 0)
            .attr("y", 0)
            .attr("transform", function (d, i) {
                return "translate(" + ((i * gridSize ) + START_MARGIN + gridSize / 2 ) + ", -5) rotate(-90)";
            })
            .attr("class", function (d, i) {
                return ((i >= 7 && i <= 16) ? "xAxisLabel mono axis axis-worktime x-axis-label" : "xAxisLabel mono axis x-axis-label");
            });

        g.selectAll('.yAxisLabel')
            .data(uniqueYAxisLabels)
            .enter().append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", START_MARGIN - 5)
            .attr("y", function (d, i) {
                return i * gridSize;
            })
            .attr("transform", `translate(${-5}, ${(gridSize / 1.5)})`)
            .attr("class", function (d, i) {
                return ((i >= 0 && i <= 4) ? "yAxisLabel mono axis axis-workweek y-axis-label" : "yAxisLabel mono axis y-axis-label");
            });

        let minValue = minBy(data, function (d) {
            return (d.value) ? d.value : 0;//TODO: Find a way to handle null values
        }).value;
        let maxValue = d3.max([maxBy(data, function (d) {
            return (d.value) ? d.value : 0;//TODO: Find a way to handle null values
        }).value, 1]);
        let domainRange = [minValue, minValue * 0.666, minValue * 0.333, noDemandChangeValue, maxValue * 0.333, maxValue * 0.666, maxValue];
        let colorScale = d3.scale.linear()
            .domain(domainRange)
            .range(colors);

        let cards = g.selectAll(".yAxisLabel")
            .data(data, function (d) {
                return d.xAxisPos + ':' + d.yAxisPos;
            });
        cards.append("title");

        let squares = cards.enter().append("rect")
            .attr("data-tip", "")
            .attr('data-for', function (d) {
                return d.xAxisLabel + "-" + d.yAxisLabel + 'tooltip';
            })
            .attr("x", function (d) {
                return (d.xAxisPos - 1) * gridSize + START_MARGIN;
            })
            .attr("y", function (d) {
                return ((d.yAxisPos - 1) * gridSize);
            })
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", function (d) {
                return colorScale(d.value);
            })
            .attr('class', 'bordered')
            .on("mouseover", function (d, e) {
                d3.select(this).style({cursor: "pointer"});
                ReactDOM.unmountComponentAtNode(self.tooltipTarget);
                self.handleTooltip(d)
            });

        squares.transition().duration(1000)
            .style("fill", function (d) {
                return colorScale(d.value);
            });
        squares.select("title").text(function (d) {
            return d.value;
        });

        let texts = cards.enter().append("text")
            .attr("class", "mono")
            .text(function (d) {
                if (d.value === 0) {
                    return "$0";
                } else if (d.value === null) {
                    return "-";
                } else {
                    if (d.value < 0) {
                        return "$" + Math.abs(d.value).toLocaleString();
                    }
                    else {
                        return "$" + d.value.toLocaleString();
                    }
                }

            })
            .attr("class", "heat-map-txt")
            .attr("fill", "white")
            .attr("x", function (d, i) {
                return (((d.xAxisPos - 1) * gridSize) + gridSize / 2) + START_MARGIN;
            })
            .attr("y", function (d, i) {
                return (((d.yAxisPos - 1) * gridSize) + gridSize / 2) + 5;
            });

        let LEGEND_BUFFER = 20;
        let legend = g.selectAll(".legend")
            .data(domainRange);

        let group = legend.enter().append("g")
            .attr("class", "legend");

        group.append("rect")
            .attr("x", function (d, i) {
                return legendElementWidth * i + START_MARGIN;
            })
            .attr("y", ((numOfProd - 1) * gridSize) + (140 + LEGEND_BUFFER))
            .attr("width", legendElementWidth)
            .attr("height", (gridSize / 2) - (LEGEND_BUFFER + 10))
            .style("fill", function (d, i) {
                return colorScale(d);
            });

        group.append("text")
            .attr("class", "legend-txt")
            .attr("text-anchor", "middle")
            .text(function (d) {
                if (d === 0) {
                    return "$0";
                }
                if (!Number.isInteger(d)) {
                    d.toFixed(2);
                }
                if (d < 0) {
                    return "-$" + Math.abs(Math.round(d)).toLocaleString();
                }
                return "$" + Math.round(d).toLocaleString();
            })
            .attr("x", function (d, i) {
                return (legendElementWidth * i + START_MARGIN * 2) + LEGEND_BUFFER;
            })
            .attr("y", ((numOfProd - 1) * gridSize) + (200 + LEGEND_BUFFER));
    }

    render() {
        return (
            <div>
                <div id="heatMapTooltip" ref={(elem) => {
                    this.tooltipTarget = elem;
                }}/>
                <div id="heatMapDiv" ref="vizDiv">
                    <svg ref={(elem) => {
                        this.svg = elem;
                    }}/>
                </div>
            </div>
        )
    }
}

HeatMap.propTypes = {
    data: React.PropTypes.array,
    tooltipComponent: React.PropTypes.func
};

export default HeatMap