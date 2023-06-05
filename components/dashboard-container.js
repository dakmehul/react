import {connect} from "react-redux";
import Dashboard from "./dashboard";
import DashboardUtil from "../common/dashboard-util";

const mapStateToProps = (state) => {
    let currentDashboard = DashboardUtil.getCurrentDashboard(state);
    return {
        dashboard: currentDashboard
    }
};

const handleDateRangeSelection = (event, picker) => {
    alert("Date Range Changed!!!");
};


const mapDispatchToProps = ({
    handleDateRangeSelection: handleDateRangeSelection
});

const DashboardContainer = connect(
    mapStateToProps,mapDispatchToProps
)(Dashboard);

export default DashboardContainer