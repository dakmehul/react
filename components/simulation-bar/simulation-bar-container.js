import SimulationBar from "./simulation-bar";
import Action from "../../actions";
import {connect} from "react-redux";


const mapStateToProps = (state) => {
    return {
        simulationsTotal: state.simulationRequest.simulations.length,
        targetLicenseMetric: state.ui.targetLicenseMetric
    }
};

const mapDispatchToProps = ({
    openBottomSheet: () => {
        return (dispatch, getState) => {
            dispatch({type: Action.OPEN_BOTTOM_SHEET});
        }
    }
});

const SimulationBarContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(SimulationBar);

export default SimulationBarContainer