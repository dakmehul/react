import {connect} from "react-redux";
import SimulateButton from "./simulate-button";
import {simulateCreator} from './action-creators/simulation-action-creator';

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = ({
    action: simulateCreator
});

const SimulateButtonContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(SimulateButton);

export default SimulateButtonContainer