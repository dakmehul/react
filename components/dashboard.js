import React, {Component} from "react";
import {Panel} from "react-bootstrap";
import Alert from "react-bootstrap/lib/Alert";
import TopFilterBar from "./top-filter-bar";
import Sidebar from "./sidebar/sidebar";
import BubbleVisualizationContainer from "./bubble-chart/bubble-visualization-container";
import HiveVisualizationContainer from "../components/hive-chart/hive-visualization";
import {selectVisualizationByDimension} from "./../selectors";
import "./dashboard.scss";
import ContentDashboard from "material-ui/svg-icons/action/dashboard";
import Spinner from "./spinner";
class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showSidebar: true
        };
        this.toggleSidebar = this.toggleSidebar.bind(this);
    }

    toggleSidebar() {
        this.setState({showSidebar: !this.state.showSidebar})
    }

    getVisualizationComponent(viz) {
        if (viz) {
            switch (viz.jsonClass) {
                case 'HiveDefinition': {
                    return <HiveVisualizationContainer
                        discriminator={this.props.discriminator}
                        showMetricsCards={this.props.showMetricsCards}/>
                }
                case 'BubbleDefinition': {
                    return <BubbleVisualizationContainer discriminator={this.props.discriminator} viz={viz}
                                                         highlightedIds={this.props.highlightedIds}
                                                         showMetricsCards={this.props.showMetricsCards}/>
                }
                default: {
                    return (<h1>Visualization not available.!</h1>)
                }
            }
        }
    }

    getSidebarComponent(discriminator, availableFilters, viz) {
        let dimension = "HOST";
        if (viz) {
            dimension = viz.dimension
        }
        if (this.state.showSidebar) {
            return (
                <Sidebar discriminator={discriminator}
                         availableFilters={availableFilters}
                         disable={dimension === 'VM'}
                />
            )
        }
    }

    getTopFilterBar(discriminator, appliedFilters, viz) {
        let vizName = "";
        if (viz) {
            vizName = viz.name;
        }
        return (<TopFilterBar appliedFilters={appliedFilters}
                              vizName={vizName}
                              toggleSidebar={this.toggleSidebar}
                              discriminator={discriminator}/>)

    }

    render() {
        console.log(this.props.isScenarioReady);
        let dashboard = this.props.dashboard;
        let discriminator = this.props.discriminator;
        let dashboardMetadata = this.props.dashboardMetadata;
        let colSpan = this.props.colSpan;
        let sidebarColSpan;
        let visualizationColSpan;
        switch (discriminator) {
            case "single":
            case "source": {
                sidebarColSpan = `col-lg-${colSpan} col-md-${colSpan} col-sm-${colSpan}`;
                visualizationColSpan = `col-lg-${12 - colSpan} col-md-${12 - colSpan} col-sm-${12 - colSpan}`;
                break;
            }
            case "target": {
                sidebarColSpan = `col-lg-${colSpan} col-sm-${colSpan} col-lg-push-${12 - colSpan} col-md-push-${12 - colSpan} col-sm-push-${12 - colSpan}`;
                visualizationColSpan = `col-lg-${12 - colSpan} col-sm-${12 - colSpan} col-lg-pull-${colSpan} col-md-pull-${colSpan} col-sm-pull-${colSpan}`;
                break;
            }
        }


        let visualization = selectVisualizationByDimension(dashboard.visualizations, dashboard.dimension);
        let showSidebar = this.state.showSidebar;

        if (!showSidebar) {
            visualizationColSpan = "col-lg-12 col-md-12 col-sm-12"
        }

        const getDashboardTitle = (name) => {
            return <div className='dashboard-title'><ContentDashboard/> {name}</div>
        };

        const tabComponent = (
            <div className="view-container">
                <Panel header={getDashboardTitle(dashboardMetadata.name)}>
                </Panel>
                <div className='dashboard'>
                    <div className={`pl-0 ${sidebarColSpan}`}>
                        {this.getSidebarComponent(discriminator, this.props.availableFilters, visualization)}
                    </div>
                    <div className={`pl-0 m-0 visualisation-height ${visualizationColSpan}`}>
                        {this.getTopFilterBar(discriminator, dashboard.appliedFilters, visualization)}
                        {this.getVisualizationComponent(visualization)}
                    </div>
                </div>
            </div>);


        const errorMsg = (<div>
            <Alert bsStyle="warning">
                <strong>{this.props.errorMsg}</strong>
            </Alert>
        </div>);

        if (this.props.showSpinner)
            return <Spinner size={40} thickness={5}/>;
        else if (this.props.errorMsg) {
            return errorMsg;
        } else {
            return tabComponent;
        }
    }
}

Dashboard.propTypes = {
    dashboardMetadata: React.PropTypes.shape({
        id: React.PropTypes.string,
        name: React.PropTypes.string,
        vendor: React.PropTypes.string,
        visualizations: React.PropTypes.array
    }),
    dashboard: React.PropTypes.shape({
        id: React.PropTypes.string,
        loading: React.PropTypes.bool,
        appliedFilters: React.PropTypes.array,
        visualizations: React.PropTypes.array
    })
};

export default Dashboard;