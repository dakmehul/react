import React, {Component} from "react";
import {connect} from "react-redux";
import {openScenarioActionCreator} from "./action-creators/scenario-action-creator";
import ScenarioDropdown from "./scenario-dropdown";
import Action from '../actions'
import RequestUtil from "../common/request-util";

const mapStateToProps = (state, ownProps) => {
    return {
        availableScenarios:state.scenarios
    }
};


const mapDispatchToProps = (dispatch, ownProps) => {
         let scenarioId = RequestUtil.get('scenarioId');

         const onScenarioChange = () => {
         let selectedScenario = RequestUtil.get('scenarioId')
         dispatch({ type: Action.SCENARIO_CHANGED, selectedScenario});
}

    return {
        onScenarioChange: onScenarioChange
    }
};


const ScenarioDropdownContainer = connect(
    mapStateToProps, mapDispatchToProps)(ScenarioDropdown);

export default ScenarioDropdownContainer