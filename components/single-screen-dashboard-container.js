import React, {Component} from "react";
import {connect} from "react-redux";
import {openSingleScreenDashboardActionCreator} from "./action-creators/dashboard-action-creator";
import SingleScreenDashboard from "./single-screen-dashboard";
import {withRouter} from 'react-router';


class SingleScreenDashboardContainer extends Component {

    componentWillMount() {
        localStorage.setItem('targetLicenseMetric', '');
        localStorage.setItem('targetMetricId', '');
        this.props.loadDashboard(this.props.match.params.id)

    }

    componentWillUpdate(nextProps) {
        this.props.loadDashboard(nextProps.match.params.id)

    }

    render() {
        let colSpan = 2;
        return (
            <SingleScreenDashboard  dashboardId={this.props.match.params.id}
                                    showMetricsCards={true}
                                    colSpan={colSpan}/>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {}
};

const mapDispatchToProps = ({
    loadDashboard: openSingleScreenDashboardActionCreator
});

SingleScreenDashboardContainer = withRouter(connect(
    mapStateToProps, mapDispatchToProps)(SingleScreenDashboardContainer));

export default SingleScreenDashboardContainer