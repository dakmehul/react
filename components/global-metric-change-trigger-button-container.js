import {connect} from "react-redux";
import GlobalMetricChangeButton from "./global-metric-change-trigger-button";
import {globalMetricChangeCreator} from './action-creators/simulation-action-creator';
import Action from "../actions";

const globalMetricChangeActionCreator =() =>{
return (dispatch, getState) => {
        let targetMetric = getState().ui.targetLicenseMetric;

        console.log("gettting state----");
        console.log(targetMetric);
          let selectedProduct = getState().ui.source.appliedFilters[0].value
         console.log(selectedProduct);
        dispatch({
            type: Action.GLOBAL_METRIC_CHANGE_STARTED,targetMetric,selectedProduct
        });
        }
}

const mapStateToProps = (state) => {
    return {
    targetLicenseMetric: state.ui.targetLicenseMetric
    };
};

const mapDispatchToProps = ({
    action:globalMetricChangeActionCreator
});

const GlobalMetricChangeButtonContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(GlobalMetricChangeButton);

export default GlobalMetricChangeButtonContainer