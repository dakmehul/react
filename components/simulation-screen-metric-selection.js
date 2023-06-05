import React, {Component,PropTypes} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import ConfirmationModal from "./common/confirmation-modal";
import {
    simulationProductActionCreator,
    simulationVendorActionCreator
} from "./action-creators/simulation-action-creator";
import SelectionDropdown from "./selection-dropdown";
import ToastFactory from "./toast-factory";
import VendorProductService from "../services/vendor-product-service";
import "./simulation-screen-metric-selection.scss";
import find from "lodash/find";
import map from "lodash/map";
import head from "lodash/head";
import FieldName from "../common/constants";
import Utils from "../common/utils";
import FlatButton from 'material-ui/FlatButton';
import Done from "material-ui/svg-icons/action/done";
import Required from "material-ui/svg-icons/action/announcement";
import { startsWith } from 'lodash'

const changeMetricsAttributeName = (metrics) => {
    return map(metrics, (m) => {
        return {"id": m.simGlobalChangeMetricsId, "name": m.globalMetricGroupName};
    });
};

class SimulationScreenWizard extends Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.goToSimulation = this.goToSimulation.bind(this);
        this.state = {
            selectedVendor: 'Select Vendor',
            vendorList: [],

            selectedProduct: 'Select Product',
            selectedProductId: '',
            productList: [],

            selectedTargetMetric: 'Select Target Metric',
            selectedTargetMetricId: '',
            availableMetrics: [],
            errorMessage:''
        };
        this.targetMetricChanged = this.targetMetricChanged.bind(this);
        this.vendorChanged = this.vendorChanged.bind(this);
        this.selectDefaults = this.selectDefaults.bind(this);
    }

    targetMetricChanged(targetMetric) {
        let newTargetMetricObj = VendorProductService.getSelectedObj(this.state.availableMetrics, targetMetric)
        this.setState({selectedTargetMetric: newTargetMetricObj.name});
        this.setState({selectedTargetMetricId: newTargetMetricObj.id});
        localStorage.setItem('targetLicenseMetric', newTargetMetricObj.name);
        localStorage.setItem('targetMetricId', newTargetMetricObj.id)
    }

    vendorChanged(vendor) {
        let newVendorObj = VendorProductService.getSelectedObj(this.props.vendorList, vendor);
        this.setState({
            selectedVendor: newVendorObj.name,
            selectedProduct: 'Select Product',
            selectedTargetMetric: 'Select Target Metric',
            availableMetrics: []
        });
        this.getProductList(this.props.metrics, newVendorObj.id)
         this.showIfSelected(this.state.selectedVendor)
    }

    targetProductChanged(productId) {
        let newProductObj = VendorProductService.getSelectedObj(this.state.productList, productId)

        this.setState({selectedProduct: newProductObj.name});
        this.setState({selectedProductId: newProductObj.id});
        this.setState({selectedTargetMetric: 'Select Target Metric'});
        this.getAvailableMetricList(newProductObj.id)
    }

    showIfSelected(selectedItem){
    // this method returns a green tick material ui icon when the field is selected with some value

    return startsWith(selectedItem,'Select') ? <Required color='white' /> : <Done color='green' className='selectedField'/>
    }

    goToSimulation() {
        let checkMetric = this.state.selectedTargetMetric.startsWith('Select')
        if (this.state.selectedTargetMetric === '' || checkMetric) {
            ToastFactory.error(`Please select the target metric!`,);
        }
        else {
            this.props.targetProductSelected(this.state.selectedProductId);
            this.props.history.push(this.props.basePath + this.props.location.search);
        }
        this.setSelectionDefault()
    }

    setSelectionDefault() {
        this.setState({
            selectedVendor: '',
            selectedProduct: '',
            selectedTargetMetric: ''
        })
    }

    getProductList(metrics, vendorId) {
        let productList = VendorProductService.getProductList(metrics, vendorId);
        this.setState({productList: productList})
    }


    getAvailableMetricList(productId) {
        if (productId === '') {
            return []
        }
        else {
            let metrics = find(this.state.productList,(p) => {
                return p.id === productId;
            }).metrics;
            let availableMetrics = changeMetricsAttributeName(metrics);
            this.setState({availableMetrics: availableMetrics})
        }

    }

    selectDefaults() {
        let props = this.props;
        let filters = props.appliedFilters;
        let appliedVendor = find(filters, function (f) {
            return f.field === FieldName.VENDOR_NAME;
        }).value;
        let appliedProduct = find(filters, function (f) {
            return f.field === FieldName.PRODUCT_NAME;
        }).value;
        if (appliedProduct && appliedProduct) {
            let vendor = Utils.getVendorFrom(props.metrics, appliedVendor);
            let product = Utils.getProductFrom(vendor, appliedProduct);
            let metrics = product.metrics;
            this.setState({
                selectedVendor: appliedVendor,
                selectedProduct: appliedProduct,
                productList: VendorProductService.changeProductsAttrName(vendor.products)
            });

            if (metrics.length === 1) {
                let metric = head(metrics)
                let metricName = metric.globalMetricGroupName;
                let metricId = metric.simGlobalChangeMetricsId;
                this.setState({
                    selectedTargetMetric: metricName,
                    availableMetrics: changeMetricsAttributeName(metrics)
                });
                localStorage.setItem('targetLicenseMetric', metricName);
                localStorage.setItem('targetMetricId',metricId)
            } else {
                let availMetrics = changeMetricsAttributeName(metrics);
                this.setState({availableMetrics: availMetrics})
            }
        }
    }

    getKeepSameBtn() {
        return (
            <div className="btnDiv">
                <FlatButton label="KEEP AS" primary={true} onTouchTap={this.selectDefaults}/>
            </div>
        );
    }

    render() {
        let self = this;
        let selectedMetric = VendorProductService.getSelectedTargetMetric(this.state.selectedTargetMetric);
        let selectedVendor = VendorProductService.getSelectedVendor(this.state.selectedVendor);
        let selectedProduct = VendorProductService.getSelectedProduct(this.state.selectedProduct);

        let vendorSelected = this.showIfSelected(selectedVendor)
        let productSelected = this.showIfSelected(selectedProduct)
        let targetMetricSelected = this.showIfSelected(selectedMetric)

        return <ConfirmationModal messageTitle='Target Metric Selection' isOpen={this.props.isOpen}
                                  action={this.goToSimulation} hideAlert={this.props.hideModal}
                                  additionalInfo={this.props.selectedProduct}>
            <div>
                <div>
                    <span>Which vendor to simulate?</span>
                    <div className="dropdownDiv">
                        <SelectionDropdown objList={this.props.vendorList} selectedField={selectedVendor}
                                           onSelectionChange={(vendor) => self.vendorChanged(vendor)}/> {vendorSelected}
                    </div>

                    <span>Which target product to simulate ?</span>
                    <div className="dropdownDiv">
                        <SelectionDropdown objList={this.state.productList} selectedField={selectedProduct}
                                           onSelectionChange={(targetProduct) => self.targetProductChanged(targetProduct)}/>  {productSelected}
                    </div>

                    <span>Which target metric to simulate ?</span>
                    <div className="dropdownDiv">
                        <SelectionDropdown objList={this.state.availableMetrics} selectedField={selectedMetric}
                                           onSelectionChange={(targetMetricId) => self.targetMetricChanged(targetMetricId)}/> {targetMetricSelected}
                    </div>
                </div>
                {this.getKeepSameBtn()}
            </div>
        </ConfirmationModal>
    }
}



const mapStateToProps = (state, ownProps) => {
    return {
        basePath: '/dashboard/simulate/' + state.ui.single.id,
        vendorList: VendorProductService.getVendorList(state.metrics),
        metrics: state.metrics,
        appliedFilters: state.ui.single.appliedFilters
    }
};

const mapDispatchToProps = ({
    vendorSelected: simulationVendorActionCreator,
    targetProductSelected: simulationProductActionCreator
});


const SimulationScreenMetricSelection = withRouter(connect(
    mapStateToProps, mapDispatchToProps)(SimulationScreenWizard));

SimulationScreenMetricSelection.propTypes = {
    selectedProduct: PropTypes.string,
    hideModal: PropTypes.func.isRequired,
    isOpen:PropTypes.bool
};

export default withRouter(SimulationScreenMetricSelection)