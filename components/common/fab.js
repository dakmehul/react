import React, {Component, PropTypes} from 'react'
import Button from 'material-ui/FloatingActionButton';

import '../tooltip.scss'

class Fab extends Component {
    render() {
        return (
            <Button id={this.props.id}
                    className='mr-10 md-fab'
                    secondary={this.props.secondary}
                    backgroundColor={this.props.color}
                    onTouchTap={this.props.action}
                    data-tip={this.props.dataTip}
                    data-for={this.props.dataFor}
                    disabled={this.props.disabled}>
                {this.props.children}

            </Button>

        )
    }
}

Fab.propTypes = {
    action: PropTypes.func
};

export default Fab;
