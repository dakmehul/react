import React from 'react'
import {Component, PropTypes} from 'react'
import en_Us from '../common/i18n'
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import BubbleChartIcon from 'material-ui/svg-icons/editor/bubble-chart';

class SizeMetricDropdown extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    };

    handleTouchTap = (event) => {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };


    handleRequestClose = () => {
        this.setState({
            open: false,
        });
    };

    render() {
        let possibleSizeMetrics = this.props.possibleSizeMetrics.map((s) => {
            return {value: s.field, label: en_Us.fields[s.field]}
        });
        let labelSizeMetric = en_Us.fields[this.props.selectedSizeMetric.field];
        let self = this;
        return (
            <span >
        <RaisedButton
            onTouchTap={this.handleTouchTap}
            label={labelSizeMetric} style={{height: '100%'}}
            icon={<BubbleChartIcon/>}
        />
        <Popover
            open={self.state.open}
            anchorEl={this.state.anchorEl}
            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
            targetOrigin={{horizontal: 'left', vertical: 'top'}}
            onRequestClose={self.handleRequestClose}
        >
          <Menu>
            {possibleSizeMetrics.map((m, i) => {
                    return (
                        <MenuItem key={i} primaryText={m.label}
                                  onClick={() => {
                                      self.props.onSizeMetricChange(m.value);
                                      self.handleRequestClose();
                                  }
                                  }
                        />
                    )
                }
            )
            }            
          </Menu>
        </Popover>
      </span>
        );
    }
}

export default SizeMetricDropdown

SizeMetricDropdown.propTypes = {
    possibleSizeMetrics: PropTypes.array.isRequired,
    selectedSizeMetric: PropTypes.object,
    onSizeMetricChange: PropTypes.func
};
