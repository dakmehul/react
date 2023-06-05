import Action from "../../actions";
import HiveService from "../../services/hive-service";
import BubbleService from "../../services/bubble-service";
import RequestFactory from "../../common/request-factory";
import {
    selectByName,
    selectDefaultUIVisualization,
    selectUIDashboard,
    selectVisualizationByDimension
} from "./../../selectors";
import VmService from "./../../services/vm-service";
import {fetchAvailableFilters} from "../../fetchers";

export const hiveChartActionCreator = (discriminator, viz) => {
    return (dispatch, getState) => {
        let showAllNodes = selectByName(viz.hiveControls, "showAllNodes").value;
        let showHollow = selectByName(viz.hiveControls, "showHollow").value;
        let uiDashboard = selectUIDashboard(discriminator, getState());
        let visRequest = RequestFactory.createSearchRequest(uiDashboard.appliedFilters, viz);
        let hiveSearchRequest = Object.assign({}, visRequest, {showAllNodes: !showAllNodes, showHollow: showHollow});
        dispatch(visualizationDataLoadingActionCreator(discriminator, viz.id));
        HiveService.fetchHivePlotResponse(hiveSearchRequest).then(function (response) {
            dispatch(visualizationDataLoadedActionCreator(discriminator, viz.id, response));
        })
    };
};

export const visualizationDataLoadedActionCreator = (discriminator, vizId, response) => {
    return {type: Action.VISUALIZATION_DATA_LOADED_SUCCESS, discriminator, vizId, response}
};

export const possibleSizeMetricsLoadedActionCreator = (discriminator, vizId, possibleSizeMetrics) => {
    return {type: Action.LOAD_POSSIBLE_SIZE_METRIC, discriminator, vizId, possibleSizeMetrics}
};

export const vmDrillDownActionCreator = (discriminator, hostName) => {
    return (dispatch, getState) => {
        let newDimension = 'VM';
        dispatch(changeVisualizationActionCreator(newDimension, discriminator));
        let dashboard = selectUIDashboard(discriminator, getState());
        let filter = dashboard.appliedFilters.filter(function (filter) {
            //TODO: Check if this can be handled in better way
            return filter.field === "productName";
        })[0];
        if (filter) {
            let viz = selectVisualizationByDimension(dashboard.visualizations, newDimension);
            dispatch(visualizationDataLoadingActionCreator(discriminator, viz.id));
            VmService.fetchVmsRunningProducts(hostName, {productName: filter.value}).then(function (response) {
                dispatch(visualizationDataLoadedActionCreator(discriminator, viz.id, {hostName, data: response.vms}));
                dispatch(possibleSizeMetricsLoadedActionCreator(discriminator, viz.id, response.possibleSizeMetrics));
            })
        }
    }
};

export const bubbleChartActionCreator = (discriminator, viz) => {
    return (dispatch, getState) => {
        let uiDashboard = selectUIDashboard(discriminator, getState());
        let visRequest = RequestFactory.createSearchRequest(uiDashboard.appliedFilters, viz);
        dispatch(visualizationDataLoadingActionCreator(discriminator, viz.id));
        BubbleService.fetchBubbleChartResponse(visRequest).then(function (response) {
            dispatch(visualizationDataLoadedActionCreator(discriminator, viz.id, response));
            dispatch(possibleSizeMetricsLoadedActionCreator(discriminator, viz.id, response.possibleSizeMetrics));
        });
    }
};

export const loadVisualizationDataActionCreator = (discriminator) => {
    return (dispatch, getState) => {
        let viz = selectDefaultUIVisualization(discriminator, getState());
        if (viz.jsonClass === "HiveDefinition") {
            dispatch(hiveChartActionCreator(discriminator, viz))
        } else {
            dispatch(bubbleChartActionCreator(discriminator, viz))
        }
    }
};

export const reRenderAvailableFilterActionCreator = (discriminator) => {
    return (dispatch, getState) => {
        let dashboard = selectUIDashboard(discriminator, getState());
        let searchRequest = RequestFactory.createSimpleSearchRequest(dashboard.appliedFilters);
        fetchAvailableFilters(dispatch, dashboard.id, discriminator, searchRequest)
    }
};

export const visualizationDataLoadingActionCreator = (discriminator, vizId) => {
    return {type: Action.VISUALIZATION_DATA_LOAD_STARTED, discriminator, vizId}
};

export const changeVisualizationActionCreator = (dimension, discriminator) => {
    return {type: Action.CHANGE_DIMENSION, discriminator, dimension}
};
export const controlValueChangedActionCreator = (discriminator, control) => {
    return {type: Action.CONTROL_VALUE_CHANGED, discriminator, control};
};