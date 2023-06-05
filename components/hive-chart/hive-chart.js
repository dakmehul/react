import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import map from 'lodash/map'
import flatMap from 'lodash/flatMap'
import reverse from 'lodash/reverse'
import forEach from 'lodash/forEach'
import filter from 'lodash/filter'
import uniqBy from 'lodash/unionBy'
import max from 'lodash/max'
import sortBy from 'lodash/sortBy'
import groupBy from 'lodash/groupBy'
import values from 'lodash/values'
import fromPairs from 'lodash/fromPairs'
import hive from './hive'
import * as d3 from "d3";
import './hive-chart.scss'

let nodesPerAxis = {};
let maxNodesPerAxis = 1;

class HiveChart extends Component {

    constructor(props) {
        super(props);
        this.state = {coordinates: {top: 0, left: 0}};
    }

    componentDidMount() {
        this.updateChart(this.props);
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillUnmount() {
        ReactDOM.unmountComponentAtNode(this.tooltipTarget);
    }

    isNormalNode(d) {
        return !this.isOutOfAxisNode(d);
    }

    isOutOfAxisNode(d) {
        return d.id === "-1";
    }

    degrees(radians) {
        return radians / Math.PI * 180 - 90;
    }

    calculateUniqueAxis(ds) {
        let totalNodes = map(ds.nodes, function (d) {
            return {'axis': d.axis, 'axisName': d.axisName, 'axisSize': d.axisSize};
        });
        let axis = uniqBy(totalNodes, 'axisName');
        let filteredAxis = filter(axis, function (d) {
            return d.axis !== -1;
        });
        return filteredAxis;
    }

    calculateNodePositions(ds) {
        //Group by axis first so we have axisName as a key and respective nodes as array against that key
        let groupedByAxis = groupBy(ds.nodes, 'axisName');

        let allLengths = map(groupedByAxis, function (d) {
            return d.length;
        });

        maxNodesPerAxis = max(allLengths);

        forEach(groupedByAxis, function (value, key) {
            let sorted = sortBy(value, 'size');
            let reversed = reverse(sorted);
            groupedByAxis[key] = reversed;
        });

        let result = flatMap(groupedByAxis,
            function (d) {
                //Sort all nodes by their size
                let a = map(d, function (dv, i) {

                    return [dv.nodeName, i];
                });
                return a;
            });
        nodesPerAxis = fromPairs(result);
    }

    handleTooltip(d, type) {
        if (this.props.tooltipComponent) {
            let tooltipComponent = this.props.tooltipComponent(5.2, d, type);
            ReactDOM.render(tooltipComponent, this.tooltipTarget);
        }
    }

    componentWillReceiveProps(nextProps) {
        this.updateChart(nextProps);
    }

    updateChart(nextProps) {
        if (this.hiveSvg) {
            this.hiveSvg.remove();
        }
        let svg = d3.select(this.svg);
        let height = nextProps.height;
        let width = nextProps.width;
        this.hiveSvg = svg
            .attr("viewBox", "0 0 " + (width) + " " + (height))
            .attr("perserveAspectRatio", "xMinYMid")
            .attr("width", width)
            .attr("height", height)
            .call(d3.behavior.zoom().on("zoom", function () {
                //svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
            }))
            .attr('class', 'hiveSvg')
            .append("g")
            .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");
        let ds = {
            nodes: nextProps.data.nodes,
            edges: nextProps.data.edges
        };
        let self = this;
        let DISTANCE_FACTOR = nextProps.distanceFactor;
        let ZOOM_FACTOR = nextProps.zoomFactor;
        let SIZE_FACTOR = nextProps.sizeFactor;
        let calculatedSizeFactor = 1;
        let calculatedDistFactor = 1;
        let calculatedZoomFactor = 1;
        this.calculateNodePositions(ds);
        //let totalNodes;
        //let aspect;
        //let DISTANCE_STEP = 0.2;
        //let repeatDuration;
        let uniqueAxis = this.calculateUniqueAxis(ds);
        let innerRadius = height / 15;
        let outerRadius = height / ZOOM_FACTOR;
        let angle = d3.scale.ordinal().domain(d3.range(uniqueAxis.length + 1)).rangePoints([0, 2 * Math.PI]);
        let radius = d3.scale.linear().range([innerRadius, outerRadius]);
        let lengthOfAxis = radius.range()[1] + outerRadius * 15 + 1000;

        calculatedZoomFactor = ZOOM_FACTOR / (maxNodesPerAxis * 0.7);
        calculatedSizeFactor = SIZE_FACTOR + .3;
        calculatedDistFactor = DISTANCE_FACTOR * calculatedSizeFactor * 12 / ((maxNodesPerAxis * 0.5) + calculatedZoomFactor * 0.5);

        //aspect = width / height;

        /*Cluster as axis*/
        this.hiveSvg.selectAll(".axis")
            .data(uniqueAxis)
            .enter().append("line")
            .attr("data-tip", "")
            .attr('data-for', function (d) {
                return d.axisName + 'tooltip';
            })
            .attr("class", "hive-axis")
            .attr("transform", function (d) {
                return "rotate(" + self.degrees(angle(parseInt(d.axis))) + ")";
            })
            .attr("x1", radius.range()[0])
            .attr("x2", lengthOfAxis)
            .on("mouseover", function (d, e) {
                ReactDOM.unmountComponentAtNode(self.tooltipTarget);
                self.handleTooltip(d, "axis");
            });


        let weights = map(ds.edges, 'weight');
        let color = d3.scale.threshold().domain([2, 3, 5, 10, 15, 20, 25]).range(['#c49c94', '#8c564b', '#aec7e8', '#1f77b4', '#ffbb78', '#ff7f0e', '#ff9896', '#d62728']);
        let strokeScale = d3.scale.linear().domain([d3.min(weights), d3.max(weights)]).range([2, 8]);

        let getNodeLocation = (d) => {
            let x = nodesPerAxis[d.nodeName];
            if (d.id === -1) {
                x = 1;
            }
            if (self.isOutOfAxisNode(d)) {
                x = d3.max(values(nodesPerAxis)) + 4;
            }
            return radius(25 / maxNodesPerAxis + x * 1.3 * calculatedDistFactor);
        };

        /*VM movement as link*/
        this.hiveSvg.selectAll(".link")
            .data(ds.edges)
            .enter().append("path")
            .attr("data-tip", "")
            .attr('data-for', function (d) {
                return d.source.nodeName + '-' + d.target.nodeName + 'tooltip';
            })
            .attr("class", "hive-link")
            .attr("d", hive.link()
                .angle(function (d) {
                    if (d === -1) {
                        return 90;
                    }
                    return angle(d.axis);
                })
                .radius(function (d, i) {
                    return getNodeLocation(d);
                }))
            .attr("fill", "none")
            .attr('transform', function (d) {
                if (d.source.axis === d.target.axis) {
                    let y = getNodeLocation(d.target);
                    let x = getNodeLocation(d.source);
                    let ty = (y - x) / 2;
                    let xCo = x * Math.cos(angle(d.target.axis));
                    let ySi = x * Math.sin(angle(d.target.axis));

                    let tyCO = ty * Math.cos(angle(d.target.axis));
                    let tySi = ty * Math.sin(angle(d.target.axis));

                    return "translate(" + (ySi + tySi) + "," + (-xCo - tyCO) + ")";
                }
                return "translate(0,0)"
            })
            .on("mouseover", function (d, e) {
                ReactDOM.unmountComponentAtNode(self.tooltipTarget);
                self.handleTooltip(d, "link");
            })
            .style("stroke-width", 0)
            .transition()
            .duration(function (d, i) {
                return i * 200;
            })
            .style("stroke", function (d) {
                if (d.source.axis === d.target.axis) {
                    return "#636363";
                }
                return "#ff4a43";
            })
            .style("stroke-width", function (d) {
                return strokeScale(d.weight);
            });

        /*Host as node*/
        this.hiveSvg.selectAll(".node")
            .data(ds.nodes)
            .enter().append("circle")
            .attr("data-tip", "")
            .attr('data-for', function (d) {
                return d.nodeName + 'tooltip';
            })
            .attr("class", "hive-node")
            .attr("transform", function (d) {
                return "rotate(" + (d.axis === -1 ? 0 : self.degrees(angle(d.axis))) + ")";
            })
            .attr("cx", getNodeLocation)
            .attr("r", function (d) {
                if (self.isNormalNode(d)) {
                    return 4 * calculatedSizeFactor;
                }
                return 10 * calculatedSizeFactor;
            })
            .style("fill", function (d) {
                if (d.isHollow === true)
                    return "#ffffff";
                else
                    return color(d.size);
            })
            .on("mouseover", function (d, e) {
                d3.select(this).style({cursor: "pointer"});
                ReactDOM.unmountComponentAtNode(self.tooltipTarget);
                self.handleTooltip(d, "node");
            })

    }

    render() {
        return (
            <div>
                <div id="targetTooltip" ref={(elem) => {
                    this.tooltipTarget = elem;
                }}/>
                <div className="hivePlot"ref="vizDiv">
                    <svg ref={(elem) => {
                        this.svg = elem;
                    }}/>
                </div>
            </div>
        );
    }
}

HiveChart.propTypes = {
    data: React.PropTypes.object,
    tooltipComponent: React.PropTypes.func,
    zoomFactor: React.PropTypes.number,
    sizeFactor: React.PropTypes.number,
    distanceFactor: React.PropTypes.number
};

export default HiveChart;