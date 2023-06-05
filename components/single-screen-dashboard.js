import {connect} from "react-redux";
import Dashboard from "./dashboard";
import {selectUIAvailableFilters, selectDashboardMetadata, selectUIDashboard} from "./../selectors";

const SINGLE = 'single';

const mapStateToProps = (state, ownProps) => {
    return {
        availableFilters:selectUIAvailableFilters(SINGLE,state),
        dashboardMetadata: selectDashboardMetadata(ownProps.dashboardId, state),
        dashboard: selectUIDashboard(SINGLE, state),
        discriminator: SINGLE,
        colSpan:ownProps.colSpan
    }
};

const SingleScreenDashboard = connect(
    mapStateToProps)(Dashboard);

export default SingleScreenDashboard