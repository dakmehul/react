import React from "react";
import NVD3Chart from "react-nvd3";
import "nvd3/build/nv.d3.css";
import {colors, height, width} from "./filter-chart-constants";

class PieFilter extends React.Component {

    constructor(props) {
        super(props);
        this.onChange = props.onChange.bind(this);
        this.configure = this.configure.bind(this);
    }

    configure(chart) {
        let self = this;
        chart.pie.dispatch.elementClick = function (e, attrs) {
            self.onChange(self.props.field, e.data);
        }
    }

    render() {
        return (<NVD3Chart
            configure={this.configure}
            type="pieChart"
            width={width}
            height={height}
            color={colors}
            datum={this.props.data}
            showLabels={false}
            showLegend={false}
            useInteractiveGuideline={true}
            x="key"
            y="value"
            renderEnd={function (chart, e) {

            }}
            renderStart={function (chart, e) {

            }}
            ready={function (chart, e) {

            }}
        />);
    }
}

export default PieFilter;
