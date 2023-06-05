import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import BubbleChart from "./bubble-chart";
import Utils from "../../common/utils";
import FieldName, {TARGET_DISCRIMINATOR} from "../../common/constants";
import find from "lodash/find";
import SizeMetricDropdown from "../size-metric-dropdown";
import MetricCards from "../metric-cards";
import ToolTip from "../tooltip";
import TooltipContent from "../tooltip-content";
import "./bubble-visualization.scss";
import Button from "../common/button";
import Spinner from "../spinner";

const vmCountBubbleColors = {
    1: '#5CB85C',
    2: '#F0AD4E',
    3: '#FF0000'
};

class BubbleVisualization extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedHostSizeMetric: props.viz.defaultSizeMetric,
            height: null,
            width: null
        };
        this.applyStyles = this.applyStyles.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.viz.dimension === 'VM' && !this.state.selectedVmSizeMetric)
            this.setState({selectedVmSizeMetric: nextProps.viz.defaultSizeMetric});
    }

    setSelectedSizeMetric(sizeMetric) {
        return (this.isHOSTVisualization()) ? this.setState({selectedHostSizeMetric: sizeMetric}) :
            this.setState({selectedVmSizeMetric: sizeMetric});
    }

    getSelectedSizeMetric() {
        return (this.isHOSTVisualization()) ? this.state.selectedHostSizeMetric : this.state.selectedVmSizeMetric;
    }

    isHOSTVisualization() {
        return this.props.viz.dimension === 'HOST';
    }

    isVmVisualization() {
        return this.props.viz.dimension === 'VM';
    }

    getVmOptions() {
        return {
            startColor: "#3296dd",
            stopColor: "#d9ecf9",
            labelField: "name"
        }
    }

    getHostOptions() {
        return {
            startColor: "#3296dd",
            stopColor: "#d9ecf9",
            labelField: "hostName"
        }
    }

    isBubbleSelected(bubble) {
        let name = bubble.hostName ? bubble.hostName : bubble.name;
        return find(this.props.highlightedIds, (n) => n === name);
    }

    componentDidMount() {
        let parentNode = ReactDOM.findDOMNode(this.refs.vizSection);
        if (parentNode) {
            let vizHeight = parentNode.clientHeight;
            let vizWidth = parentNode.clientWidth;
            console.log('Bubble Dimensions:' + vizWidth + "," + vizHeight);
            this.setState({height: vizHeight, width: vizWidth});
        }
    }

    sizeMetricChanged(viz, sizeMetric) {
        let newSizeMetric = find(viz.possibleSizeMetrics, (f) => {
            return f.field === sizeMetric;
        });
        this.setSelectedSizeMetric(newSizeMetric)
    }

    fillColor(d, colorMetric, colorScale) {
        let value = colorScale(d[colorMetric]);
        if (d.runningProducts) {
            let numberOfProduct = d.runningProducts.length;
            return (numberOfProduct >= 3) ? vmCountBubbleColors[3] : vmCountBubbleColors[numberOfProduct];
        }
        return (!d.isDirectlyInstalled) ? value : "#D3D3D3";
    }

    getMetricsCard(viz, showMetricsCards, metricCardsColSpan) {
        let data = viz.data;
        if (data && showMetricsCards && viz.dimension === 'HOST') {
            return (
                <div className={`col-lg-${metricCardsColSpan}`}>
                    <MetricCards metricSummaries={data.metricSummaries}/>
                </div>);
        }
    }

    applyStyles(bubble, data) {
        if (this.isBubbleSelected(data)) {
            bubble.style("stroke-width", "3")
                .style("stroke", "black")
                .style("opacity", "0.5")
        } else {
            bubble.style("stroke-width", "1")
                .style("stroke", "#8e9091")
                .style("opacity", "1");
        }
    }

    getVisualizationSection(viz) {
        let options = this.getHostOptions();
        let props = this.props;
        if (!viz.loading) {
            if (!viz.data || !viz.data.data || viz.data.data.length === 0) {
                return <p style={{height: '100px', textAlign: 'center'}} className="text-italic text-lg">No data
                    available.</p>
            }
            if (viz.data.data.length > 5000) {
                return (
                    <text className="txtMsg">Too many bubbles to show, Apply some filters to show all the bubbles</text>
                );
            } else {
                if (this.isVmVisualization()) {
                    options = this.getVmOptions();
                }
                let tooltipComponent = (offset, d) => {
                    let fields = [];


                    fields = [options.labelField, FieldName.CLUSTER_NAME, viz.colorField.field, viz.defaultSizeMetric.field,
                        FieldName.TOTAL_VIRTUAL_PROCESSORS_SUPPORTING_PRODUCT, FieldName.TOTAL_VIRT_PROCS_ASSIGNED_FOR_HOST,
                        FieldName.SERVER_DEMAND, FieldName.LICENSE_TYPE, FieldName.PHYSICAL_CPU_CORES_TOTAL, FieldName.VMS_WITH_PRODUCT,
                        FieldName.VMWARE_SLICES_AVAILABLE, FieldName.VMWARE_SLICES_USED, FieldName.RUNNING_PRODUCTS
                    ];

                    //Custom: for the target dashboard neither server demand nor the license type should be visible in the tooltip

                    if (props.discriminator === TARGET_DISCRIMINATOR) {
                        fields = fields.filter(function (f) {
                            return f !== 'serverDemand' && f !== 'licenseTypeName'
                        })
                    }

                    let copyEnabledFields = [options.labelField, FieldName.CLUSTER_NAME];
                    let tooltipData = Utils.createTooltipData(d, options.labelField, fields, copyEnabledFields);
                    const tooltipComponent = (
                        <ToolTip offset={offset} id={tooltipData.id}>
                            <TooltipContent data={tooltipData}/>
                        </ToolTip>
                    );
                    return tooltipComponent;
                };
                return (
                    <BubbleChart
                        data={viz.data.data}
                        height={this.state.height}
                        width={this.state.width}
                        dimension={viz.dimension}
                        sizeMetric={this.getSelectedSizeMetric().field}
                        colorMetric={viz.colorField.field}
                        colorRange={[options.startColor, options.stopColor]}
                        onBubbleClick={props.onBubbleClick}
                        fillColor={this.fillColor}
                        labelField={options.labelField}
                        tooltipComponent={tooltipComponent}
                        applyStyles={this.applyStyles}
                    />
                );
            }
        } else {
            return (<Spinner/>);
        }
    }

    getDropdownMenu(viz) {
        let revisedPossibleSizeMetrics = [];
        if (this.props.discriminator === TARGET_DISCRIMINATOR) {
            revisedPossibleSizeMetrics = viz.possibleSizeMetrics.filter(function (f) {
                return f.field !== 'serverDemand';
            })
        }
        else
            revisedPossibleSizeMetrics = viz.possibleSizeMetrics;

        let self = this;
        let dropdown = (<li style={{height: '100%'}}>
            <SizeMetricDropdown
                possibleSizeMetrics={revisedPossibleSizeMetrics}
                selectedSizeMetric={this.getSelectedSizeMetric()}
                onSizeMetricChange={(sizeMetric) => self.sizeMetricChanged(viz, sizeMetric)}
            />
        </li>);
        return (
            <ul className="controls">
                {dropdown}
            </ul>);
    }

    getTargetMetricNotification(targetMetric, discriminator) {
        if (targetMetric && discriminator === 'target')
            return <h3> Target Metric : {targetMetric} </h3>;
    }

    getBackToHostButton() {
        if (this.isVmVisualization())
            return (
                <Button
                    label='Back To Hosts View'
                    className='btn btn-primary btn-ef btn-ef-3 btn-ef-3c mb-10 back-btn'
                    icon='fa fa-arrow-left'
                    action={this.props.handleChangeVisualization}>
                </Button>
            );
    }

    // TODO: Should come from ES index
    getVisualizationTitle(viz) {
        if (viz.dimension === 'HOST') {
            return viz.name + ' representing physical servers'
        }
        else if (viz.data && viz.dimension === 'VM') {
            return viz.name + ' representing VMs running on ' + viz.data.hostName;
        }
    }

    render() {
        let viz = this.props.viz;
        let showMetricsCards = this.props.showMetricsCards;
        let bubbleComponent = <div/>;
        let vizColSpan = 9;
        let metricCardsColSpan = 12 - vizColSpan;
        let tryMetric = localStorage.getItem('targetLicenseMetric');
        if (!showMetricsCards) {
            vizColSpan = 12
        }
        if (this.state.height !== null && this.state.height !== 0)
            bubbleComponent = this.getVisualizationSection(viz);

        return (
            <section id="vis-section" className="tile ht-100-per">
                <div className="tile-header dvd dvd-btm">
                    <h1 className="custom-font ml-10"><strong>{this.getVisualizationTitle(viz)}</strong></h1>
                    {this.getDropdownMenu(viz)}
                </div>
                <div id="visualization-chart" className="m-0 row tile-body table-custom ht-100-per">
                    {this.getTargetMetricNotification(tryMetric, this.props.discriminator)}
                    {this.getBackToHostButton()}
                    <div className={`col-lg-${vizColSpan} vizDiv`} ref="vizSection" style={{height: '100%'}}>
                        {bubbleComponent}
                    </div>
                    {this.getMetricsCard(viz, showMetricsCards, metricCardsColSpan)}
                </div>
            </section>
        );
    }
}

BubbleVisualization.propTypes = {
    viz: PropTypes.object
};

export default BubbleVisualization
