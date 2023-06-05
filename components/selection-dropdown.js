import React, {Component, PropTypes} from "react";
import Popover from "material-ui/Popover";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import RaisedButton from "material-ui/RaisedButton";
import Assignment from "material-ui/svg-icons/action/assignment";

class SelectionDropdown extends Component {

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
            anchorEl: event.currentTarget
        });
    };


    handleRequestClose = () => {
        this.setState({
            open: false,
        });
    };

    render() {
        let self = this;
        return (
            <span style={{'fontSize': '22px'}}>
              <RaisedButton
                  labelStyle={{'fontSize': '18px'}}
                  onTouchTap={this.handleTouchTap}
                  label={this.props.selectedField} style={{height: '100%', 'padding': '8px', 'fontSize': '24px'}}
                  icon={<Assignment/>}/>
              <Popover open={self.state.open} anchorEl={self.state.anchorEl} anchorOrigin={{horizontal: 'left', vertical: 'bottom'}} targetOrigin={{horizontal: 'left', vertical: 'top'}}
                       onRequestClose={self.handleRequestClose}>
                  <Menu>
                      {self.props.objList.map((m, index) => {
                          return (
                              <MenuItem key={m.id} primaryText={m.name}
                                        onClick={() => {
                                            self.props.onSelectionChange(m.id);
                                            self.handleRequestClose();
                                        }} style={{'fontSize': '18px'}}/>
                          );
                      })
                      }
                  </Menu>
              </Popover>
              </span>
        );
    }
}

export default SelectionDropdown

SelectionDropdown.propTypes = {
    objList: PropTypes.array.isRequired,
    selectedField: PropTypes.string,
    onSelectionChange: PropTypes.func
};