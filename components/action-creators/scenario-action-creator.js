import Action from "../../actions";
import ScenarioService from "../../services/scenario-service";

export const scenarioAcceptedOrRevertedActionCreator = (dispatch) => {
    dispatch({type: Action.SIMULATIONS_EXISTS, response:{simulationsExists:false}})
};

export const scenarioReadinessActionCreator = () =>{
     return (dispatch, getState) => {
    ScenarioService.isScenarioReady().then(function (response){
        console.log("Scenario readiness" + JSON.stringify(response));
        dispatch({type:Action.SCENARIO_READINESS_SUCCESS,response});
    })
    }
}


export const scenarioAcceptActionCreator = () => {
    return (dispatch, getState) => {
        ScenarioService.acceptScenario().then(function (response) {
            console.log("Scenario accept response" + JSON.stringify(response));
            dispatch({type: Action.SCENARIO_ACCEPTED, response});
            scenarioAcceptedOrRevertedActionCreator(dispatch)
        })
    }
};

export const scenarioRevertActionCreator = () => {
    return (dispatch, getState) => {
        ScenarioService.revertScenario().then(function (response) {
            console.log("Scenario revert response" + JSON.stringify(response));
            dispatch({type: Action.SCENARIO_REVERTED, response});
            scenarioAcceptedOrRevertedActionCreator(dispatch)
        });
    }
};

export const checkSimulationsExistsActionCreator = () => {
    return (dispatch, getState) => {
        ScenarioService.isSimulationExists().then(function (response) {
            dispatch({type: Action.SIMULATIONS_EXISTS, response});
        });
    }
};