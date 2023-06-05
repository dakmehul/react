import React, {Component, PropTypes} from "react";
import Collapsible from "react-collapsible";
import RangeFilter from "./range-filter";
import BarFilter from "./bar-filter";
import PieFilter from "./pie-filter";
import RadioFilter from "./radio-filter";
import en_Us from "../../common/i18n";
import {connect} from "react-redux";
import Action from "../../actions";
import {
    loadVisualizationDataActionCreator,
    reRenderAvailableFilterActionCreator
} from "../action-creators/visualization-action-creator";
import {selectUIDashboard} from "./../../selectors";
import {find, take} from "lodash";
import "./sidebar.scss";
import Spinner from "../spinner";
import Constants from "../../common/constants";

const getRangeFilterComponent = (self, f, reset) => {

    return <RangeFilter filter={f.filter} range={f.range} onRangeChanged={(field, values, maxVal, minVal) => {
        let appliedFilter = {
            field,
            'from': values.min,
            'to': values.max
        };
        if (values.max === maxVal && values.min === minVal) {
            self.removeFilter(appliedFilter);
        }
        else {
            self.applyFilter(appliedFilter);
        }
    }} reset={reset}
    />;
};


const getPieFilterComponent = (self, f) => {
    return <PieFilter data={take(f.buckets, 500)} field={f.filter.field} onChange={(field, data) => {
        let appliedFilter = {
            field: field,
            value: data.key
        };
        self.applyFilter(appliedFilter);
    }}/>;
};

const getBarFilterComponent = (self, f) => {
    return <BarFilter data={take(f.buckets, 10).sort((e1, e2) => {
        if (parseInt(e1.key) < parseInt(e2.key))
            return -1;
        if (parseInt(e1.key) > parseInt(e2.key))
            return 1;
        return 0;

    })} field={f.filter.field} onChange={(field, data) => {
        self.applyFilter({
            field: field,
            value: data.key
        });
    }}/>;
};

const getRadioFilterComponent = (self, f, reset) => {
    return <RadioFilter values={f.filter.values} field={f.filter.field} onChange={(field, value) => {
        console.log('on change: ' + value);
        if (value === 'All') {
            self.removeFilter(f.filter);
        } else {
            let displayLabel = find(f.filter.values, ['value', value]).label;
            self.applyFilter({
                field: field,
                value: value,
                filterWidget: f.filter.filterWidget,
                label: displayLabel
            });
        }
    }} className='radio-button' reset={reset}/>;
};


class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            accordionFlag: true
        };
        this.applyFilter = props.applyFilter.bind(this);
        this.removeFilter = props.removeFilter.bind(this);
    }

    render() {
        let self = this;
        let disableStyle = {};
        if (this.props.disable) {
            disableStyle = {
                pointerEvents: 'none',
                opacity: 0.5
            }
        }
        const selectFromCurrentlyAppliedFilter = (field) => {
            return self.props.appliedFilters.filter(function (appFilter) {
                return field === appFilter.field;
            });
        };

        const getSideBarFilters = () => {
            if (this.props.availableFilters && this.props.availableFilters.length > 0) {
                return this.props.availableFilters.map(function (f, index) {
                    let filter = <div>To Be Implemented</div>;
                    let currentlyAppliedFilter = selectFromCurrentlyAppliedFilter(f.filter.field);
                    switch (f.filter.filterWidget) {
                        case 'RANGE_SLIDER': {
                            let reset = false;
                            if (currentlyAppliedFilter.length === 0) {
                                reset = true;
                            }
                            filter = getRangeFilterComponent(self, f, reset);
                            break;
                        }
                        case 'PIE':
                            filter = getPieFilterComponent(self, f);
                            break;
                        case 'BAR':
                            filter = getBarFilterComponent(self, f);
                            break;
                        case 'RADIO': {
                            let reset = false;
                            if (currentlyAppliedFilter.length === 0) {
                                reset = true;
                            }
                            filter = getRadioFilterComponent(self, f, reset);
                            break;
                        }
                        default: {
                            return (<h1>No data Available</h1>)
                        }
                    }
                    return <Collapsible classParentString='Collapsible' trigger={en_Us.fields[f.filter.field]}
                                        style={{margin: '0 auto'}} key={index}
                                        open={self.state.accordionFlag}>{filter}</Collapsible>

                });

            } else {
                return <Spinner position="sidebar-center"/>
            }

        };


        if (!this.props.hide) {
            return (
                <div id="sidebar" style={disableStyle}>
                    <div id="sidebar-wrap">
                        <div className="slimScrollDiv">
                            <div id="navigation">
                                {getSideBarFilters()}
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
}


Sidebar.propTypes = {
    availableFilters: PropTypes.array
};


const mapDispatchToProps = (dispatch, ownProps) => {

    const removeFilter = (filter) => {
        dispatch({type: Action.REMOVE_FILTER, discriminator: ownProps.discriminator, filter});
        dispatch(loadVisualizationDataActionCreator(ownProps.discriminator));
    };

    const applyFilter = (filter) => {
        dispatch({type: Action.APPLY_FILTER, discriminator: ownProps.discriminator, appliedFilter: filter});
        dispatch(loadVisualizationDataActionCreator(ownProps.discriminator));
        if (filter.field === Constants.PRODUCT_NAME || filter.field === Constants.VENDOR_NAME) {
            dispatch(reRenderAvailableFilterActionCreator(ownProps.discriminator))
        }
    };

    return {
        applyFilter: applyFilter,
        removeFilter: removeFilter
    };
};

Sidebar = connect((state, ownProps) => {
    let dashboard = selectUIDashboard(ownProps.discriminator, state);
    return {
        appliedFilters: dashboard.appliedFilters
    }
}, mapDispatchToProps)(Sidebar);

export default Sidebar