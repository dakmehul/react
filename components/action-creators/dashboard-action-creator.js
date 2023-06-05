import Action from '../../actions'
import {fetchDashboard, fetchTargetDashboardFromServer} from './../../fetchers'

export const availableFiltersLoadedSuccessActionCreator = (dashboardId, discriminator, availableFilters) => {
    return {type: Action.AVAILABLE_FILTERS_LOADED, dashboardId, discriminator, availableFilters};
};

export const dashboardLoadedSuccessActionCreator = (discriminator, dashboard) => {
    console.log(discriminator);
    return {type: Action.DASHBOARD_LOADED_SUCCESS, discriminator, dashboard};
};

export const openSingleScreenDashboardActionCreator = (dashboardId) => {
    return (dispatch, getState) => {
        dispatch({type: Action.OPEN_SINGLE_SCREEN_DASHBOARD, dashboardId, targetMetricId: ''});
        fetchDashboard(dashboardId, 'single', dispatch, getState);
    }
};

export const openSimulationScreenDashboardActionCreator = (discriminator, dashboardId) => {
    return (dispatch, getState) => {
        dispatch({type: Action.OPEN_SIMULATE_SCREEN_DASHBOARD, dashboardId});
        fetchDashboard(dashboardId, 'source', dispatch, getState);
    }
};

export const fetchTargetDashboardActionCreator = () => {
    return (dispatch, getState) => {
        dispatch({type: Action.TARGET_DASHBOARD_LOADED_SUCCESS});
        fetchTargetDashboardFromServer(dispatch, getState);
    };
};

export const applyFilterActionCreator = (discriminator, filter) => {
    return {type: Action.APPLY_FILTER, discriminator: discriminator, appliedFilter: filter};
};