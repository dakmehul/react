import React, {Component} from "react";
import {Tab, Tabs} from "react-bootstrap-tabs";
import HeatMap from "../heat-map/new-heat-map";
import BackButton from "../common/back-button";
import ProductsSummaryTable from "../products-summary-table";
import Alert from "react-bootstrap/lib/Alert";
import Spinner from "../spinner";
import FieldName from "../../common/constants";
import ToolTip from "../tooltip";
import TooltipContent from "../tooltip-content";
import Utils from "../../common/utils";
import "./simulation-result-screen.scss";

const summaryHeading = "Simulation Result Summary";

const hostAndClusterTabLabels = {
    "host": {
        "hostLabel": "Host Level Simulation Effects"
    },
    "cluster": {
        "clusterLabel": "Cluster Level Simulation Effects"
    }
};

class SimulationResultTab extends Component {

    getBackButton() {
        return (
            <div className="floating-back-btn"><BackButton/></div>
        );
    }

    prepareDataForToolTip(d) {
        function getFormattedCost(cost) {
            if (cost == null) {
                return '-'
            }
            else {
                return '$ ' + cost.toLocaleString()
            }

        }

        return {
            xAxisLabel: d.xAxisLabel,
            yAxisLabel: d.yAxisLabel,
            currentDemand: d.licensingSituation.currentDemand,
            currentCost: getFormattedCost(d.licensingSituation.currentCost),
            currentLicenseType: d.licensingSituation.currentLicenseType,
            simulatedDemand: d.licensingSituation.simulatedDemand,
            simulatedCost: getFormattedCost(d.licensingSituation.simulatedCost),
            simulatedLicenseType: d.licensingSituation.simulatedLicenseType
        };
    }

    getHeatMapToolTipComponent(d, offset) {
        let id = undefined;
        let copyEnabledFields;
        let tooltipData;
        let tooltipChildren;
        let fields = [FieldName.CURRENT_DEMAND, FieldName.CURRENT_COST, FieldName.CURRENT_LICENSE_TYPE,
            FieldName.SIMULATED_DEMAND, FieldName.SIMULATED_LICENSE_TYPE, FieldName.SIMULATED_COST, FieldName.X_AXIS_LABEL,
            FieldName.Y_AXIS_LABEL];
        let dataObj = this.prepareDataForToolTip(d);
        copyEnabledFields = [FieldName.Y_AXIS_LABEL, FieldName.X_AXIS_LABEL];
        tooltipData = Utils.createTooltipData(dataObj, id, fields, copyEnabledFields);
        tooltipChildren = <TooltipContent data={tooltipData}/>;

        const tooltipComponent = (
            <ToolTip offset={offset} id={d.xAxisLabel + "-" + d.yAxisLabel} effect="float">
                {tooltipChildren}
            </ToolTip>
        );
        return tooltipComponent;
    }

    getHeatMapOptions() {
        let self = this;
        return {
            options: {
                tooltipComponent: function (offset, d) {
                    return self.getHeatMapToolTipComponent(d, offset)
                }
            }
        }
    }

    getHeatMap(data) {
        let props = this.props;
        let config = this.getHeatMapOptions();
        if (data.length <= 0) {
            return <h3>No data available</h3>;
        } else {
            return (
                <HeatMap margins={props.margins}
                         heightFactor={props.heightFactor}
                         widthFactor={props.widthFactor}
                         colors={props.colors}
                         tooltipComponent={config.options.tooltipComponent}
                         data={data}/>
            );
        }
    };

    getTabComponent(tabLabel, affectedProducts, heatMapData) {
        return (
            <Tab label={tabLabel} role="presentation" className="tile tile-shadow result">
                <div>
                    <section id="vis-section" className="tile ht-100-per">
                        <div className="tile-header dvd dvd-btm">
                            <h1 className="custom-font ml-10"><strong>{summaryHeading}</strong></h1>
                        </div>
                        <div id="visualization-chart" className="m-0 row tile-body table-custom ht-100-per">
                            <ProductsSummaryTable affectedProducts={affectedProducts}/>
                        </div>
                    </section>
                </div>
                <div>
                    <section id="vis-section" className="tile ht-100-per">
                        <div className="tile-header dvd dvd-btm">
                            <h1 className="custom-font ml-10"><strong>{tabLabel}</strong></h1>
                        </div>
                        <div id="visualization-chart" className="m-0 row tile-body table-custom ht-100-per">
                            {this.getHeatMap(heatMapData)}
                        </div>
                        {this.getBackButton()}
                    </section>
                </div>
            </Tab>
        );
    }

    render() {
        let props = this.props;
        let simulationResult = props.simulationResult;
        const tabComponent = (
            <Tabs onSelect={(index, label) => console.log(label + ' selected')} className="nav nav-tabs mt-20">
                {this.getTabComponent(hostAndClusterTabLabels.host.hostLabel, simulationResult.affectedProducts, simulationResult.affectedServers)}
                {this.getTabComponent(hostAndClusterTabLabels.cluster.clusterLabel, simulationResult.affectedProducts, simulationResult.affectedClusters)}
            </Tabs>
        );

        const spinner = (<Spinner/>);

        const errorMsg = (<div>
            <Alert bsStyle="danger">
                <strong>{props.simulationResult.errorMsg}</strong>
            </Alert>
            {this.getBackButton()}
        </div>);

        if (props.simulationResult.showSpinner)
            return spinner;
        else if (props.simulationResult.errorMsg) {
            return errorMsg;
        } else {
            return tabComponent;
        }

    }
}

export default SimulationResultTab;