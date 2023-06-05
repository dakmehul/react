import React, {Component, PropTypes} from 'react'
import Fab from "./fab"
import { browserHistory } from 'react-router';
import ContentBack from "material-ui/svg-icons/content/reply";
import history from './../../history'

class BackButton extends Component {
    render() {
        return (

            <Fab action={()=> history.goBack()} >
                <ContentBack/>
            </Fab>

        )
    }
}

BackButton.propTypes = {
    action: PropTypes.func
};

export default BackButton;
