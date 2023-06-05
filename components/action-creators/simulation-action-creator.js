import Action from "../../actions";
import store from "../../store";
import SimulationService from "../../services/simulation-service";
import GlobalMetricChangeService from "../../services/global-metric-change-service"
import map from "lodash/map";
import omit from "lodash/omit";

export const addSimulationActionCreator = (simulations) => {
    return (dispatch, getState) => {
        dispatch({type: Action.APPEND_SIMULATION_REQUEST, simulations});
    };
};

export const removeSimulationCreator = (simulation) => {
    store.dispatch({type: Action.REMOVE_SIMULATION, simulation});
};

export const simulationVendorActionCreator = (simVendor) => {
    return (dispatch, getState) => {
        dispatch({type: Action.SIM_VENDOR_SELECTED, simVendor})
    }
};

export const simulationProductActionCreator = () => {
    return (dispatch, getState) => {
        dispatch({type: Action.TARGET_PRODUCT_SELECTED})
    }
};

export const globalMetricChangeEndActionCreator =()=>{
    return(dispatch,getState) => {
     dispatch({type:Action.GLOBAL_SIMULATION_END})
     }
};

export const globalMetricChangeStartActionCreator = (sourceProductName, targetMetricId) => {


    return (dispatch, getState) => {
        let mockIL = getState().ui.mockGlobalSimulation;

        let globalMetricChangeReq = Object.assign({}, {sourceProductName, targetMetricId, mockIL});

        GlobalMetricChangeService.simulateGlobalMetric(globalMetricChangeReq).then(function (response) {
            dispatch({
                type: Action.GLOBAL_SIMULATION_COMPLETED,
                globalSimulateResult: response
            });
        })

    }
};

export const simulateCreator = () => {
    return (dispatch, getState) => {
        const {simulationRequest} = getState();
        console.log("now in simulate creator");
        let sourceProductName = getState().ui.source.appliedFilters[0].value;
        dispatch({
            type: Action.SIMULATION_STARTED
        });

        let newSimulations = map(simulationRequest.simulations, function (s) {
            return omit(s, "sourceHost")
        });

        let targetMetricId = localStorage.getItem('targetMetricId');

        let newRequest = Object.assign({}, simulationRequest, {
            simulations: newSimulations,
            sourceProductName: sourceProductName,
            targetMetricId: parseInt(targetMetricId)
        });

        SimulationService.simulate(newRequest).then(function (response) {
                dispatch({
                    type: Action.SIMULATION_COMPLETED,
                    simulateResult: response
                });
                dispatch({
                    type: Action.REMOVE_SIMULATION_REQUESTS
                });
                dispatch({
                    type: Action.SIMULATIONS_EXISTS,
                    response: {simulationsExists: true}
                })
            }, function (res) {
                dispatch({
                    type: Action.SIMULATION_COMPLETED,
                    simulateResult: {
                        errorMsg: 'Failed to complete simulation request'
                    }
                });
            }
        )
    }
};

