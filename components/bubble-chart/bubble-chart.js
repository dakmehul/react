import React, {Component} from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import map from "lodash/map";
import "./bubble-chart.scss"

class BubbleChart extends Component {

    constructor(props) {
        super(props);
        this.getRadius = this.getRadius.bind(this);
    }

    componentDidMount() {
        this.initChart(this.props);
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        this.pack = this.createPackLayout(nextProps);
        this.updateChart(nextProps);
    }

    componentWillUnmount() {
        ReactDOM.unmountComponentAtNode(this.tooltipTarget);
    }

    createPackLayout(props) {
        let self = this;
        let valueOfPackLayout = (d) => {
            let value = d[props.sizeMetric + ""];
            if (value === 0) {
                value = 0.2;
            }
            if (value === undefined)
                value = 0.2; //When size metric field does not exist in the data
            return value;
        };

        return d3.layout.pack()
            .padding(10)
            .size([props.width, props.height])
            .value(
                props.valueOfPackLayout || valueOfPackLayout
            )
            .sort(function comparator(a, b) {
                return b[props.sizeMetric] - a[props.sizeMetric];
            })
            .children(function (d) {
                if (d.bucketField === "root") {
                    return d.bubbles;
                } else {
                    let packChildrenFunc = props.packChildren || self.packChildren;
                    return packChildrenFunc(d);
                }
            });
    }

    initChart(props) {
        let height = props.height;
        let width = props.width;
        let data = props.data;

        let svg = d3.select(this.svg)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 " + (width) + " " + (height))
            .attr("perserveAspectRatio", "xMinYMid")
            .attr('class', 'bubbleSvg')
            .append("g");

        this.pack = this.createPackLayout(props);

        this.updateChart(props);
    }

    getRadius(d) {
        //TODO: Think about possibility of moving this calculation to server side
        let r = d.r;
        if (!r || r === null || isNaN(r) || r === 0) {
            r = 0.8;
        }
        if (d.parent && d.parent.children
            && d.parent.children.length === 1 && d.parent !== this.props.data) {
            r = d.r / 10;
        }
        return r;
    }

    getRoot(response) {
        let root = {
            "key": "Bubbles",
            "bucketField": "root",
            "bubbles": [],
            initialized: false
        };
        response.forEach(function (d) {
            root.bubbles.push(Object.assign({}, d));
        });
        return root;
    }

    handleTooltip(d) {
        if (this.props.tooltipComponent) {
            let tooltipComponent = this.props.tooltipComponent(this.getRadius(d), d);
            ReactDOM.render(tooltipComponent, this.tooltipTarget);
        }
    }

    packChildren(d) {
        return [];
    }

    fillColor(d, colorMetric, colorScale) {
        return colorScale(d[colorMetric]);
    }

    updateChart(nextProps) {
        const self = this;
        const props = nextProps;
        let data = props.data;
        let bubbleSvg = d3.select(this.svg);
        let root = this.getRoot(data);
        let startColor = "#3296dc";
        let stopColor = "#d9ecf9";
        let defaultColorRange = [startColor, stopColor];
        let node = bubbleSvg.data([root])
            .selectAll("g")
            .data(this.pack.nodes);

        if (root.bubbles.length !== 0) {
            node.transition()
                .duration(300)
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + (d.y) + ")";
                })
        }

        let enterSelection = node.enter()
            .append("g")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + (d.y) + ")";
            })
            .attr("class", "bubbleNode");

        let circles = enterSelection.append("circle");
        let exitSelection = node.exit().remove();

        node.selectAll("text").remove();

        node.append("text")
            .attr("data-tip", "")
            .attr('data-for', function (d) {
                return d.hostName + 'tooltip';
            })
            .attr('id', function (d) {
                return props.location + d[props.labelField] + 'text'
            })
            .attr("dy", ".3em")
            .attr("class", "bubble-txt")
            .style("text-anchor", "middle")
            .style('pointer-events', 'none')
            .style('display', function (d) {
                if (self.getRadius(d) < 14) {
                    return 'none';
                }
                return 'inline';
            })
            .on("click", function (data) {
                ReactDOM.unmountComponentAtNode(self.tooltipTarget);
                props.onClick(data);
            })
            .text(function (d) {
                return d.parent ? d[props.labelField].substring(0, d.r / 4) : "";
            });

        const defaultColorMetric = () => {
            return props.sizeMetric; //When colorMetric is not passed in props
        };

        let colorComputedMetrics = map(root.bubbles, props.colorMetric || defaultColorMetric());
        let max = d3.max(colorComputedMetrics);
        let min = d3.min(colorComputedMetrics);
        max = d3.max([Math.abs(min), max]);
        if (!max) {
            max = 1;
        }

        let domainRange = [-1 * max, max];
        let colorScale = d3.scale.linear()
            .domain(domainRange)
            .range(props.colorRange || defaultColorRange)
            .interpolate(d3.interpolateHcl);


        // This will be called on enter() as well as update()
        if (root.bubbles.length !== 0) {

            node.select("circle")
                .attr("data-tip", "")
                .attr('data-for', function (d) {
                    return d[props.labelField] + 'tooltip';
                })
                .style("fill", function fillColor(d) {
                    let fillColorFunc = props.fillColor || self.fillColor;
                    return fillColorFunc(d, props.colorMetric || defaultColorMetric(), colorScale);
                })
                .attr("r", self.getRadius)
                .attr("class", function (d) {
                    return d.parent ? d.children ? "node bubble" : "node bubble leaf" : "node bubble node--root";
                })
                .attr('id', function (d) {
                    return props.location + d[props.labelField] + 'circle'
                })
                .on("mouseover", function (d, e) {
                    d3.select(this).style({cursor: "pointer"});
                    ReactDOM.unmountComponentAtNode(self.tooltipTarget);
                    self.handleTooltip(d)
                })
                .on("click", function (data) {
                    ReactDOM.unmountComponentAtNode(self.tooltipTarget);
                    props.onBubbleClick(data, d3.select(this));
                })
                .attr("class", "bubbleNode")
                .each(function (d) {
                    let bubble = d3.select(this);
                    self.props.applyStyles(bubble, d)
                });
        }

    }

    render() {
        return (
            <div>
                <div id="targetTooltip" ref={(elem) => {
                    this.tooltipTarget = elem;
                }}/>
                <svg id="bubbleSvg" ref={(elem) => {
                    this.svg = elem;
                }}/>
            </div>
        );
    }

}

BubbleChart.propTypes = {
    data: React.PropTypes.array.isRequired,
    height: React.PropTypes.number,
    width: React.PropTypes.number,
    sizeMetric: React.PropTypes.string.isRequired,
    colorMetric: React.PropTypes.string,
    colorRange: React.PropTypes.array,
    valueOfPackLayout: React.PropTypes.func,
    packChildren: React.PropTypes.func,
    onBubbleClick: React.PropTypes.func,
    fillColor: React.PropTypes.func,
    labelField: React.PropTypes.string.isRequired,
    tooltipComponent: React.PropTypes.func,
    dimension: React.PropTypes.string.isRequired
};


export default BubbleChart