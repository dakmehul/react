import React, {Component, PropTypes} from "react";
import ReactDOM from "react-dom";
import connect from "react-redux/lib/connect/connect";
import HiveChart from "./hive-chart";
import Utils from "../../common/utils";
import FieldName from "../../common/constants";
import MetricCards from "../metric-cards";
import {
    controlValueChangedActionCreator,
    loadVisualizationDataActionCreator
} from "../action-creators/visualization-action-creator";
import {selectDefaultUIVisualization} from "../../selectors";
import Toggle from "material-ui/Toggle";
import ToolTip from "../tooltip";
import "../hive-visualization.scss";
import DateRangeSelection from "../common/date-range-picker/date-range-selection";
import CopyToClipboard from "react-copy-to-clipboard";
import TooltipContent from "../tooltip-content";
import Spinner from "../spinner";

function EdgeTooltip(props) {
    let data = props.data;
    return (
        <div>
            <b>VMs Moved:</b><br/>
            <ul>
                {data.payload.map(function (d, i) {
                    return (
                        <li key={i}>
                            <div>
                                <CopyToClipboard id="clipboard" text={d.name} onCopy={() => {
                                }}>
                                <span>
                                    <text>{d.name}</text>
                                    <i className="fa fa-clipboard hover-icon" aria-hidden="true"/>
                                </span>
                                </CopyToClipboard>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <b>From:</b> : {data.source.nodeName}<br/>
            <b>To:</b> : {data.target.nodeName}
        </div>
    );
}

const styles = {
    toggle: {
        marginTop: '10px',
        paddingRight: '10px',
    },
};

class HiveVisualization extends Component {

    constructor(props) {
        super(props);
        this.state = {
            zoomFactor: 13,
            sizeFactor: 1,
            distanceFactor: 1,
            reanimate: false,
            height: null,
            width: null
        };
        this.zoomIn = this.zoomIn.bind(this);
        this.zoomOut = this.zoomOut.bind(this);
        this.increaseSize = this.increaseSize.bind(this);
        this.decreaseSize = this.decreaseSize.bind(this);
        this.increaseDistance = this.increaseDistance.bind(this);
        this.decreaseDistance = this.decreaseDistance.bind(this);
        this.reanimateEdges = this.reanimateEdges.bind(this);
    }

    componentDidMount() {
        let parentNode = ReactDOM.findDOMNode(this.refs.vizSection);
        if (parentNode) {
            let vizHeight = parentNode.clientHeight;
            let vizWidth = parentNode.clientWidth;
            console.log('Hive Dimensions:' + vizWidth + "," + vizHeight);
            this.setState({height: vizHeight - 115, width: vizWidth});
        }
    }

    zoomIn() {
        let zoomFactor = this.state.zoomFactor;
        if (zoomFactor > 0.3) {
            this.setState({zoomFactor: zoomFactor - 0.3});
        }
        console.log('zoom factor now : ' + this.state.zoomFactor);
    };

    zoomOut() {
        let zoomFactor = this.state.zoomFactor;
        this.setState({zoomFactor: zoomFactor + 0.3});
        console.log('zoom factor now : ' + this.state.zoomFactor);
    };

    increaseSize() {
        let sizeFactor = this.state.sizeFactor;
        this.setState({sizeFactor: sizeFactor + 0.5});
        console.log('zoom factor now : ' + this.state.sizeFactor);
    };

    decreaseSize() {
        let sizeFactor = this.state.sizeFactor;
        if (sizeFactor > 0.5) {
            this.setState({sizeFactor: sizeFactor - 0.5});
        }
        console.log('size factor now : ' + this.state.sizeFactor);
    };

    increaseDistance() {
        let distanceFactor = this.state.distanceFactor;
        this.setState({distanceFactor: distanceFactor + 0.2});
        console.log('distance factor now : ' + this.state.distanceFactor);
    };

    decreaseDistance() {
        let distanceFactor = this.state.distanceFactor;
        if (distanceFactor > 0.2) {
            this.setState({distanceFactor: distanceFactor - 0.2});
        }
        console.log('distance factor now : ' + this.state.distanceFactor);
    };

    reanimateEdges() {
        let self = this;
        self.setState({
            reanimate: !self.state.reanimate
        });
    }

    prepareDataForTooltip(d, fields) {
        let newData;
        if (d.additionalFields) {
            newData = d.additionalFields;
        }
        let preparedObj = Object.assign({}, newData, d);

        return preparedObj;
    }

    getTooltipComponent(d, offset, type) {
        let id;
        let copyEnabledFields;
        let tooltipData;
        let tooltipChildren;
        let fields = [FieldName.TOTAL_VIRTUAL_PROCESSORS_SUPPORTING_PRODUCT, FieldName.TOTAL_VIRT_PROCS_ASSIGNED_FOR_HOST,
            FieldName.SERVER_DEMAND, FieldName.PHYSICAL_CPU_CORES_TOTAL, FieldName.VMS_WITH_PRODUCT,
            FieldName.VMWARE_SLICES_AVAILABLE, FieldName.VMWARE_SLICES_USED, FieldName.NODE_NAME, FieldName.AXIS_NAME,
            FieldName.NUMBER_OF_VMS, FieldName.AXIS_SIZE, FieldName.PVU_FACTOR, FieldName.ORACLE_CORE_FACTOR
        ];

        switch (type) {
            case "node": {
                id = "nodeName";
                copyEnabledFields = [FieldName.NODE_NAME, FieldName.AXIS_NAME];
                let tooltipBaseData = this.prepareDataForTooltip(d, fields);
                tooltipData = Utils.createTooltipData(tooltipBaseData, id, fields, copyEnabledFields);
                tooltipChildren = <TooltipContent data={tooltipData}/>;
                break;
            }
            case "axis": {
                id = "axisName";
                copyEnabledFields = [FieldName.AXIS_NAME, FieldName.AXIS_NAME];
                tooltipData = Utils.createTooltipData(d, id, fields, copyEnabledFields);
                tooltipChildren = <TooltipContent data={tooltipData}/>;
                break;
            }
            case "link": {
                copyEnabledFields = [FieldName.FROM, FieldName.TO, FieldName.AXIS_NAME];
                tooltipData = {id: d.source.nodeName + '-' + d.target.nodeName};
                tooltipChildren = <EdgeTooltip data={d} id={tooltipData.id}/>;
                break;
            }
        }

        const tooltipComponent = (
            <ToolTip offset={offset} id={tooltipData.id} effect="float">
                {tooltipChildren}
            </ToolTip>
        );
        return tooltipComponent;
    }

    getHiveOptions() {
        let self = this;
        return {
            options: {
                tooltipComponent: function (offset, d, type) {
                    return self.getTooltipComponent(d, offset, type)
                }
            }
        }
    }

    getScaleControls() {
        return (
            <div>
                <label><b>Zoom: </b></label>
                <span className="mb-10" role="toolbar">
                            <span className="btn-group btn-group-xs">
                                <button onClick={this.zoomIn} type="button" className="btn btn-default ml-10"><i
                                    className="fa fa-plus"/></button>
                                <button onClick={this.zoomOut} type="button" className="btn btn-default"><i
                                    className="fa fa-minus"/></button>
                            </span>
                </span>

                <label className="ml-40"><b>Bubble Size Scale: </b></label>
                <span className="mb-10" role="toolbar">
                            <span className="btn-group btn-group-xs">
                                <button onClick={this.increaseSize} type="button" className="btn btn-default ml-10"><i
                                    className="fa fa-plus"/></button>
                                <button type="button" className="btn btn-default" onClick={this.decreaseSize}><i
                                    className="fa fa-minus"/></button>
                            </span>
                </span>

                <label className="ml-40"><b>Distance Factor: </b></label>
                <span className="mb-10" role="toolbar">
                            <span className="btn-group btn-group-xs">
                                <button onClick={this.increaseDistance} type="button" className="btn btn-default ml-10"><i
                                    className="fa fa-plus"/></button>
                                <button type="button" className="btn btn-default" onClick={this.decreaseDistance}><i
                                    className="fa fa-minus"/></button>
                            </span>
                </span>

                <span className="mb-10" role="toolbar">
                            <span className="btn-group btn-group-xs">
                                <button onClick={this.reanimateEdges} type="button" className="btn btn-default ml-10"><i
                                    className="fa fa-play"/></button>
                            </span>
                </span>

            </div>
        );
    }

    getVisualizationSection(viz) {
        let self = this;
        let config = self.getHiveOptions();
        let data = viz.data;
        if (data) {
            return (
                <HiveChart data={data} zoomFactor={self.state.zoomFactor} sizeFactor={self.state.sizeFactor}
                           distanceFactor={self.state.distanceFactor}
                           tooltipComponent={config.options.tooltipComponent}
                           height={this.state.height}
                           width={this.state.width}/>
            );
        } else {
            return <Spinner size={80} thickness={10}/>
        }
    }

    getMetricsCard(viz, showMetricsCards, metricCardsColSpan) {
        if (showMetricsCards) {
            let data = viz.data;
            if (data) {
                return (
                    <div className={`col-lg-${metricCardsColSpan}`}>
                        <MetricCards metricSummaries={data.metricSummaries}/>
                    </div>
                );
            }
        }
    }

    getSwitches(controls) {
        let self = this;
        let uiControls = controls.map(function (c, index) {
            return (
                <li className="form-group" key={index}>
                    <label className="ml-10 inline-block control-label labelwitinheader"><b>{c.label}:</b></label>
                    <div className="onoffswitch primary inline-block">
                        <Toggle
                            defaultToggled={c.value}
                            labelPosition="left"
                            onToggle={() => {
                                c.value = !c.value;
                                self.props.onControlValueChange(c)
                            }}
                            style={styles.toggle}
                        /></div>
                </li>
            );
        });

        return (
            <ul className="controls">
                {uiControls}
                <li className="form-group"><DateRangeSelection discriminator={self.props.discriminator}/></li>
            </ul>
        );
    }

    render() {
        let viz = this.props.viz;
        if (viz) {
            let switchControls = viz.hiveControls;
            let component = <div/>;
            let showMetricsCards = this.props.showMetricsCards;
            let vizColSpan = 9;
            let metricCardsColSpan = 12 - vizColSpan;
            if (!showMetricsCards) {
                vizColSpan = 12
            }
            if (this.state.height !== null && this.state.height !== 0)
                component = this.getVisualizationSection(viz);
            return (
                <section id="vis-section" className="tile ht-100-per">
                    <div className="tile-header dvd dvd-btm">
                        <h1 className="custom-font ml-10"><strong>{viz.name}</strong></h1>
                        {this.getSwitches(switchControls)}
                    </div>

                    <div id="visualization-chart" className="m-0 row tile-body table-custom ht-100-per">
                        <div className={`col-lg-${vizColSpan}`} ref="vizSection" style={{height: '100%'}}>
                            {this.getScaleControls()}
                            {component}
                        </div>
                        {this.getMetricsCard(viz, showMetricsCards, metricCardsColSpan)}
                    </div>
                </section>
            );
        } else {
            return <div/>
        }

    }
}

const mapStateToProps = (state, ownProps) => {
    let visualization = selectDefaultUIVisualization(ownProps.discriminator, state);
    return {
        viz: visualization,
        discriminator: ownProps.discriminator
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    const onControlValueChange = (control) => {
        dispatch(controlValueChangedActionCreator(ownProps.discriminator, control));
        dispatch(loadVisualizationDataActionCreator(ownProps.discriminator))
    };

    return {
        onControlValueChange: onControlValueChange
    };
};

HiveVisualization.propTypes = {
    viz: PropTypes.object,
    onControlValueChange: PropTypes.func
};

const HiveVisualizationContainer = connect(mapStateToProps, mapDispatchToProps)(HiveVisualization);

export default HiveVisualizationContainer