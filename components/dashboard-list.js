import React, {Component} from "react";
import {Link} from "react-router-dom";
import {withRouter} from 'react-router';
import Spinner from "./spinner";
import Alert from "react-bootstrap/lib/Alert";


function DashboardLink(props) {

    return (
        <div>
            <Link to={props.path} className="list-group-item" onClick={() => {
                if (props.onDashboardSelection) {
                    props.onDashboardSelection(props.dashboard.id);
                }
            }}>{props.dashboard.name}</Link>
        </div>)

}

class DashboardList extends Component {
   getNewPath(dashboard){
    let path = this.props.basePath + `${dashboard.id}` + '?';

    if(this.props.location.search){
      path = this.props.basePath +`${dashboard.id}` + this.props.location.search;
    }

    return path;
    }
    render() {

      {
        return (
            <div className="container w-500 p-15 bg-white mt-30">
                <div className="row">
                    <div className="col-md-12">
                        <h2 className="text-light text-grey"/>

                        <div className="list-group w-360">
                            {
                                this.props.dashboards.map((dashboard, index) => {


                                    return (<DashboardLink key={index} path={this.getNewPath(dashboard)}
                                                           dashboard={dashboard}
                                                           onDashboardSelection={this.props.onDashboardSelection}/>)
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
        }

    }
}

DashboardList.propTypes = {
    dashboards: React.PropTypes.array.isRequired,
    isScenarioReady:React.PropTypes.bool,
    message:React.PropTypes.string
};


export default withRouter(DashboardList);
