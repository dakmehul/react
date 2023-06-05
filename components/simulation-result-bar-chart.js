import React from "react";
import NVD3Chart from "react-nvd3";
import "nvd3/build/nv.d3.css";
import {colors} from "./sidebar/filter-chart-constants";


class SimResultBarChart extends React.Component {

    constructor(props) {
        super(props);
    }

    configure(chart) {
        chart.multibar.dispatch.elementClick = function (e) {
            alert(JSON.stringify(e.data))
        };
        console.log(chart.tooltip.contentGenerator);
        chart.tooltip.contentGenerator(function (d) {
            return "$" + d.data.cost + " for " + d.data.demand
        });
        return chart;
    }

    render() {
        let mixedData = this.props.data;
        let unknownLicType = "Unknown license type";

        let currentMetricData = mixedData[0].totalProductDemands.map(function (f) {

            return {
                name: f.licenseTypeName,
                demand: f.currentDemand,
                cost:f.currentCost
            }
        });

        let targetMetricData = mixedData[1].totalProductDemands.map(function(f){
            return {
                            name: f.licenseTypeName,
                            demand: f.simulatedDemand,
                            cost:f.simulatedCost
                    }
        });

        let data = [
            {
                key: "Current Cost",
                values: currentMetricData
            },
            {
                key: "Simulated Cost",
                values: targetMetricData
            }

        ];
        return (<NVD3Chart
            configure={this.configure}
            type='multiBarHorizontalChart'
            datum={data}
            width={this.props.width}
            height={this.props.height}
            margin={{'top': 30, 'right': 20, 'bottom': 50, 'left': 320}}
            x='name'
            y='cost'
            showControls={false}
            showValues={true}
            showXAxis={true}
            staggerLabels={false}
            color={colors}
            id='globalResultBarChart'
            showYAxis={true}
            useInteractiveGuideline={true}
            showGridLines={false}
        />);
    }

}

export default SimResultBarChart;
