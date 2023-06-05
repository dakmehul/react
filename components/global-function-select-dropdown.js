import React, {Component, PropTypes} from 'react';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import {connect} from "react-redux";
import Action from "../actions";

const styles = {
    customWidth: {
        width: 200,
    },
};

class GlobalFunctionsDropDown extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: 1,
        };
    }

    handleChange = (event, index, value) => {
        this.setState({value});
        this.props.onGlobalFunctionSelect(this.props.availableGlobalFunctions[value].name);
    };

    render() {
        self = this;
        return (
            <div>
                <DropDownMenu value={this.state.value} onChange={this.handleChange}>
                    {self.props.availableGlobalFunctions.map((g, i) => {
                        return (<MenuItem value={1} key={i} primaryText={g.name}/>)
                    })}
                </DropDownMenu>
                <br/>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {}
};

const mapDispatchToProps = (dispatch, ownProps) => {

    const onGlobalFunctionSelect = (selectedGlobalFunc) => {
        dispatch({type: Action.GLOBAL_FUNCTION_SELECTED, selectedGlobalFunc});
    };

    return {
        onGlobalFunctionSelect: onGlobalFunctionSelect
    }
};

GlobalFunctionsDropDown = connect(mapStateToProps, mapDispatchToProps)(GlobalFunctionsDropDown);

GlobalFunctionsDropDown.propTypes = {
    availableGlobalFunctions: PropTypes.array.isRequired,
    onGlobalFunctionSelect: PropTypes.func
};

export default GlobalFunctionsDropDown