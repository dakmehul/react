import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";
import ContentGlobal from "material-ui/svg-icons/social/public";
import Fab from "./common/fab";
import {withRouter} from "react-router";
import checkSimulationsExistsActionCreator from "./action-creators/scenario-action-creator";

class GlobalMetricChangeButton extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Fab action={this.props.action} color='rgb(255, 64, 129)' disabled={this.props.disabled}>
                <ContentGlobal/>
            </Fab>
        );

    }
}

const mapStateToProps = (state) => {
    return {
        simulationsExists: state.scenario.simulationsExists
    };
};

const mapDispatchToProps = ({
    checkSimulationsExists: checkSimulationsExistsActionCreator
});


GlobalMetricChangeButton.propTypes = {
    action: PropTypes.func,
    disabled:PropTypes.bool
};

GlobalMetricChangeButton = withRouter(connect(mapStateToProps, mapDispatchToProps)(GlobalMetricChangeButton));
export default GlobalMetricChangeButton;