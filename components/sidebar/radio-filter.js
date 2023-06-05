import React from "react";
import {RadioButton, RadioButtonGroup} from "material-ui/RadioButton";
import "./radio-filter.scss";

const styles = {
    block: {
        maxWidth: 250,
    },
    radioButton: {
        marginBottom: 16
    },
    color: {
        color: '#aaaaaa'
    }
};


class RadioFilter extends React.Component {
    constructor(props) {
        super(props);
        // This is static, we assume that for all radio button, we will always have All option.
        // ok?
        this.onChange = props.onChange.bind(this);
        this.state = {
            value: 'All'
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.reset === true) {
            this.setState({value: 'All'});
        }
    }

    render() {
        let self = this;
        let radioButtons = self.props.values.map(function (value) {
            return <RadioButton label={value.label} value={value.value} key={value.label}
                                style={styles.radioButton} inputStyle={styles.color} labelStyle={styles.color}
            />;

        });

        return (
            <div style={{marginLeft: '20px'}}>
                <RadioButtonGroup name={this.props.field} valueSelected={self.state.value} onChange={(e, value) => {
                    self.onChange(self.props.field, value);
                    self.setState({value: value});
                }}>
                    {radioButtons}
                    <RadioButton label='All' value='All' key='All' style={styles.radioButton}
                                 labelStyle={styles.color}/>
                </RadioButtonGroup>
            </div>
        );
    }
}

RadioFilter.propTypes = {
    field: React.PropTypes.string,
    values: React.PropTypes.array,
    onChange: React.PropTypes.func,
    reset: React.PropTypes.bool
};


export default RadioFilter;
