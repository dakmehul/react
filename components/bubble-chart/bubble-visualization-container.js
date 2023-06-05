import React from "react";
import {connect} from "react-redux";
import BubbleVisualization from "./bubble-visualization";
import {
    changeVisualizationActionCreator,
    vmDrillDownActionCreator
} from "../action-creators/visualization-action-creator";
import {addSimulationActionCreator} from "../action-creators/simulation-action-creator";
import find from "lodash/find";
import remove from "lodash/remove";
import isEmpty from "lodash/isEmpty";
import ToastFactory from "../toast-factory";

const mapStateToProps = (state, ownProps) => {
    return {
        highlightedIds: ownProps.highlightedIds,
        targetLicenseMetric:state.ui.targetLicenseMetric,
        discriminator:ownProps.discriminator
    };
};

const isHost = (dimension) => {
    return dimension === "HOST"
};

const isVM = (dimension) => {
    return dimension === "VM"
};

let selectedVMs = [];
let simulations = [];
let sourceHost = undefined;

const isVmAlreadySelected = (selectedVm) => {
    let vm = find(selectedVMs, function (v) {
        return v === selectedVm.name;
    });
    return !!(vm)
};

const highlightBubble = (bubble) => {
    bubble.style('stroke-width', '3')
        .style('stroke', 'black')
        .style('opacity', '0.5');
};

const updateBubbleStyle = (bubble, data, isSelected) => {
    if (data.hostName) {
        highlightBubble(bubble)
    } else if (data.name && !isSelected) {
        highlightBubble(bubble)
    }
    else {
        bubble.style('stroke-width', '1')
            .style('stroke', '#8e9091')
            .style('opacity', '1');
    }
};

const getBubbleClickCallback = (discriminator, dimension, dispatch) => {
    switch (discriminator) {
        case "single": {
            if (isHost(dimension)) {
                return (data) => {
                    if (data.isDirectlyInstalled === false) {
                        dispatch(vmDrillDownActionCreator(discriminator, data.hostName));
                    }
                }
            }
            break;
        }

        case "source": {
            if (isHost(dimension)) {
                return (data, e) => {
                    sourceHost = data.hostName;
                    if (data.isDirectlyInstalled === false) {
                        dispatch(vmDrillDownActionCreator(discriminator, data.hostName));
                    }
                }
            }
            if (isVM(dimension)) {
                return (data, e) => {
                    let isSelected = isVmAlreadySelected(data);
                    if (!isSelected) {
                        selectedVMs.push(data.name);
                    } else {
                        remove(selectedVMs, function (v) {
                            return v === data.name;
                        })
                    }
                    updateBubbleStyle(e, data, isSelected);
                }
            }
            break;
        }

        case "target": {
            if (isHost(dimension)) {
                return (data, e) => {
                    if (!isEmpty(selectedVMs)) {
                        updateBubbleStyle(e, data);
                        simulations = selectedVMs.map(function (v) {
                            return {
                                vm: v,
                                sourceHost: sourceHost,
                                targetHost: data.hostName
                            }
                        });
                        dispatch(addSimulationActionCreator(simulations));
                        dispatch(changeVisualizationActionCreator("HOST", "source"));
                        selectedVMs = simulations = [];
                        ToastFactory.success(`VMs added to target host ${data.hostName} for simulation!`);
                    } else {
                        ToastFactory.notify(`please select VMs from the left dashboard before selecting the target host!`);
                    }
                };
            }
            break;
        }
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        showMetricsCards: ownProps.showMetricsCards,
        onBubbleClick: getBubbleClickCallback(ownProps.discriminator, ownProps.viz.dimension, dispatch),
        handleChangeVisualization: () => {
            dispatch(changeVisualizationActionCreator("HOST", ownProps.discriminator))
        }

    };
};

const BubbleVisualizationContainer = connect(mapStateToProps, mapDispatchToProps)(BubbleVisualization);

export default BubbleVisualizationContainer