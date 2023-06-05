import React from "react";
import {connect} from "react-redux";
import FinalVMsToBeSimulated from "./final-vms-tobe-simulated";
import Action from '../../actions'


const mapStateToProps = (state) => {
    return {
        simulationsTotal: state.simulationRequest.simulations.length,
        checked: state.simulationRequest.mockIL,
        simulations: state.simulationRequest.simulations,
        bottomSheetVisible: state.bottomSheet.visible,
    }
};

const mapDispatchToProps = ({
    onCheckBoxChange: () => {
        return (dispatch, getState) => {
            dispatch({type: Action.SET_MOCK_SIMULATION});
        }
    },
    closeBottomSheet: () => {
        return (dispatch, getState) => {
            dispatch({type: Action.CLOSE_BOTTOM_SHEET});
        }
    }

});

const FinalVMsToBeSimulatedContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(FinalVMsToBeSimulated);

export default FinalVMsToBeSimulatedContainer