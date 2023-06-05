import React, {Component, PropTypes} from "react";
import ReactTooltip from "react-tooltip";
import "./tooltip.scss";

class ToolTip extends Component {

    render() {
        let self = this;
        let tooltipId = self.props.id;
        let effect = this.props.effect || 'solid'
        return (
            <ReactTooltip id={tooltipId + 'tooltip'} class='extraClass nvtooltip' effect={effect} delayHide={1000} delayShow={300}
                offset={{ top: -12, left: -(this.props.offset) }}>
                {this.props.children}
            </ReactTooltip>
        );
    }
}

ToolTip.propTypes = {
    id: PropTypes.string
};

export default ToolTip;




