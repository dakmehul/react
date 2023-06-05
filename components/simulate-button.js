import React, {Component, PropTypes} from 'react'
import ContentPlayArrow from "material-ui/svg-icons/av/play-arrow"
import Fab from "./common/fab";
import {Link} from "react-router-dom";
import {withRouter} from "react-router";

class SimulateButton extends Component {

    render() {
        let resultPath = `/simulationResult`
            if(this.props.location.search){
               resultPath += this.props.location.search;
            }
            return (
                    <Link to={resultPath}>
                        <Fab action={this.props.action}>
                            <ContentPlayArrow/>
                        </Fab>
                    </Link>
                    )


    }
}

SimulateButton.propTypes = {
    action: PropTypes.func
};

export default withRouter(SimulateButton);