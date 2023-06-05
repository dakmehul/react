import React from 'react';
import {Component, PropTypes} from 'react'

class Button extends Component {
    render() {
        return (
            <button onClick={this.props.action} className={this.props.className}>{this.props.label}<i className={this.props.icon}/></button>
        )
    }
}

Button.propTypes = {
    label: PropTypes.string,
    action: PropTypes.func.isRequired,
    className:PropTypes.string,
    icon:PropTypes.string
};

export default Button