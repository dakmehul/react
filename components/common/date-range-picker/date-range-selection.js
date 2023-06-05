import React, {Component} from "react";
import {connect} from "react-redux";
import DateRangePicker from "react-bootstrap-daterangepicker/lib/index";
import "react-bootstrap-daterangepicker/css/daterangepicker.css";
import moment from "moment";
import "./date-range-picker.scss";
import {applyFilterActionCreator} from "../../action-creators/dashboard-action-creator";
import {loadVisualizationDataActionCreator} from "../../action-creators/visualization-action-creator";
import RaisedButton from "material-ui/RaisedButton";
import DateRange from "material-ui/svg-icons/action/date-range";

class DateRangeSelection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ranges: {
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                'Last 90 Days': [moment().subtract(90, 'days'), moment().subtract(1, 'days')],
                'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'month').startOf('year')]
            },
            startDate: moment().subtract(90, 'days'),
            endDate: moment().subtract(1, 'days'),
        };
        this.handleEvent = this.handleEvent.bind(this);
    }

    componentWillMount() {
        this.dispatchAppliedFilter();
    }

    getFormatedDate(date) {
        return date.format('MMM DD,YYYY');
    }

    handleEvent(event, picker) {
        let startDate = picker.startDate;
        let endDate = picker.endDate;
        if (!(this.getFormatedDate(this.state.startDate) === this.getFormatedDate(startDate)
            && this.getFormatedDate(this.state.endDate) === this.getFormatedDate(endDate))) {
            this.setState({
                startDate: startDate,
                endDate: endDate
            });
            this.dispatchAppliedFilter();
        }
    }

    dispatchAppliedFilter() {
        let self = this;
        let startDate = self.state.startDate.valueOf();
        let endDate = self.state.endDate.valueOf();
        let filter = {
            "field": "moveDate",
            "from": startDate,
            "to": endDate
        };
        self.props.applyFilter(filter);
    }

    render() {
        let start = this.state.startDate.format('MMM DD,YYYY');
        let end = this.state.endDate.format('MMM DD,YYYY');
        let label = start + ' - ' + end;
        if (start === end) {
            label = start;
        }

        return (
            <DateRangePicker startDate={this.state.startDate} endDate={this.state.endDate}
                             ranges={this.state.ranges} onEvent={this.handleEvent} style={{height: '100%'}}>
                <span>
                    <RaisedButton
                        onTouchTap={this.handleTouchTap}
                        label={label} style={{height: '100%'}} icon={<DateRange />}

                    />
                </span>
            </DateRangePicker>
        );

    }
}

DateRangeSelection.contextTypes = {
    discriminator: React.PropTypes.string
};

const mapDispatchToProps = (dispatch, ownProps) => {

    const applyFilter = (filter) => {
        dispatch(applyFilterActionCreator(ownProps.discriminator, filter));
        dispatch(loadVisualizationDataActionCreator(ownProps.discriminator));
    };

    return {
        applyFilter: applyFilter
    };
};

DateRangeSelection = connect((state, ownProps) => {
    return {
        discriminator: ownProps.discriminator
    }
}, mapDispatchToProps)(DateRangeSelection);

export default DateRangeSelection;