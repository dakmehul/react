import React from "react";
import NVD3Chart from "react-nvd3";
import "nvd3/build/nv.d3.css";
import {colors, height, width} from "./filter-chart-constants";


class BarFilter extends React.Component {

    constructor(props) {
        super(props);
        this.onChange = props.onChange.bind(this);
        this.configure = this.configure.bind(this);
    }

    configure(chart) {
        let self = this;
        chart.discretebar.dispatch.elementClick = function (e, attrs) {
            self.onChange(self.props.field, e.data);
        }
    }

    render() {

        let data = [{
            key: 'Key',
            values: this.props.data
        }];
        return (<NVD3Chart
            configure={this.configure}
            type="discreteBarChart"
            datum={data}
            width={width}
            height={height}
            x='key'
            y='count'
            showControls={true}
            showValues={false}
            showXAxis={true}
            staggerLabels={false}
            color={colors}
            showYAxis={false}
            useInteractiveGuideline={true}
            showGridLines={false}
        />);
    }

}

export default BarFilter;
