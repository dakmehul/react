import {connect} from "react-redux";
import DashboardList from "./dashboard-list";
import {withRouter} from "react-router";

const SingleScreenDashboardSelection = withRouter(connect((state) => {
    return {
        dashboards: state.availableDashboards,
        basePath: '/dashboard/',
        isScenarioReady:state.scenarioReadiness.isScenarioReady,
        message:state.scenarioReadiness.message
    }
})(DashboardList));


export default SingleScreenDashboardSelection