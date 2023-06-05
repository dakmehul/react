import React, {Component, PropTypes} from "react";
import InputRange from "react-input-range";
import "./range-filter.scss";

class RangeFilter extends Component {
    constructor(props) {
        super(props);
        this.onRangeChanged = props.onRangeChanged.bind(this);
        this.state = {
            value: {
                min: this.props.range[0],
                max: this.props.range[1]
            }
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.reset === true) {
            this.setState({
                value: {
                    min: this.props.range[0],
                    max: this.props.range[1]
                }
            });
        }
    }

    render() {
        let minVal = parseInt(this.props.range[0]);
        let maxVal = parseInt(this.props.range[1]);

        if (minVal == maxVal || minVal == undefined || maxVal == undefined){
           return <div></div>
        }
        else {
        return (
            <InputRange
                maxValue={maxVal}
                minValue={minVal}
                value={this.state.value}
                onChange={ value => this.setState({value}) }
                onChangeComplete={ value => this.onRangeChanged(this.props.filter.field, value, maxVal, minVal) }
            />
        );
        }
    }
}

RangeFilter.propTypes = {
    filter: React.PropTypes.shape({
        entities: React.PropTypes.array,
        field: React.PropTypes.string,
        filterWidget: React.PropTypes.string,
        jsonClass: React.PropTypes.string
    }),
    range: PropTypes.array,
    onRangeChanged: PropTypes.func,
    reset: PropTypes.bool
};

export default RangeFilter;