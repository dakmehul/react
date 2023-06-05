import React, {Component, PropTypes} from "react";
import {connect} from "react-redux";
import en_Us from "../common/i18n";
import Action from "../actions";
import {
    loadVisualizationDataActionCreator,
    reRenderAvailableFilterActionCreator
} from "./action-creators/visualization-action-creator";
import "./TopFilterBar.scss";
import FilterChip from "./filter-chip";
import {selectUIDashboard, selectVisualizationByDimension} from "../selectors";
import Constants from "../common/constants";

const styles = {
    chip: {
        margin: 4,
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    }
};

class TopFilterBar extends Component {

    render() {
        if (this.props.appliedFilters) {
            let appliedFilters = this.props.appliedFilters;
            let removeFilter = this.props.onRemoveFilter;
            let toggleFilter = this.props.onToggleFilter;


            const getFilters = () => {
                return appliedFilters.map(function (f) {

                    return <FilterChip key={f.field} filter={f} onToggle={toggleFilter} onDelete={removeFilter}
                                       >

                    </FilterChip>;
                });
            };

            return (
                <div className="filter-bar">
                    <div style={styles.wrapper}>
                        <span className="sidebar-collapse" onClick={this.props.toggleSidebar}>
                            <i className="fa fa-navicon"/>
                        </span>
                        {getFilters()}
                    </div>
                </div>
            );
        }
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {

    const onRemoveFilter = (filter) => {
        dispatch({type: Action.REMOVE_FILTER, discriminator: ownProps.discriminator, filter});
        dispatch(loadVisualizationDataActionCreator(ownProps.discriminator));
        if (filter.field === Constants.PRODUCT_NAME || filter.field === Constants.VENDOR_NAME) {
            dispatch(reRenderAvailableFilterActionCreator(ownProps.discriminator))
        }
    };

    const onToggleFilter = (field) => {
        dispatch({type: Action.TOGGLE_FILTER, discriminator: ownProps.discriminator, field});
        dispatch(loadVisualizationDataActionCreator(ownProps.discriminator));
        if (field === Constants.PRODUCT_NAME || field === Constants.VENDOR_NAME) {
            dispatch(reRenderAvailableFilterActionCreator(ownProps.discriminator))
        }
    };

    return {
        onRemoveFilter: onRemoveFilter,
        onToggleFilter: onToggleFilter
    }
};

TopFilterBar = connect((state, ownProps) => {
    let dashboard = selectUIDashboard(ownProps.discriminator, state);
    let loading = true;
    let viz = selectVisualizationByDimension(dashboard.visualizations, dashboard.dimension);
    if (viz) {
        loading = viz.loading;
    }
    return {
        loading: loading
    }
}, mapDispatchToProps)(TopFilterBar);

TopFilterBar.propTypes = {
    appliedFilters: PropTypes.array,
    toggleSidebar: PropTypes.func,
    vizName: PropTypes.string
};

export default TopFilterBar