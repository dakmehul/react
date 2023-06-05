import React, {Component, PropTypes} from "react";
import {Step, StepLabel, Stepper} from "material-ui/Stepper";
import Popover from "material-ui/Popover";
import Menu from "material-ui/Menu";
import {Panel} from "react-bootstrap";
import MenuItem from "material-ui/MenuItem";
import {connect} from "react-redux";
import RaisedButton from "material-ui/RaisedButton";
import FlatButton from "material-ui/FlatButton";
import RequestUtil from "../../common/request-util";
import {globalMetricChangeStartActionCreator,globalMetricChangeEndActionCreator} from "../action-creators/simulation-action-creator";
import FunctionIcon from "material-ui/svg-icons/editor/functions";
import SimResultBarChart from "../simulation-result-bar-chart";
import ArrowForwardIcon from "material-ui/svg-icons/navigation/arrow-forward";
import Done from "material-ui/svg-icons/action/done";
import Required from "material-ui/svg-icons/action/announcement";
import { startsWith } from 'lodash'
import ToastFactory from "../toast-factory";
import Action from "../../actions";
import {GridList} from 'material-ui/GridList';
import SelectionDropdown from "../selection-dropdown";
import VendorProductService from "../../services/vendor-product-service";
import "./global-metric-stepper.scss"
import Checkbox from "material-ui/Checkbox";
import Spinner from "../spinner";

import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import Utils from "../../common/utils"
/**
 * Vertical steppers are designed for narrow screen sizes. They are ideal for mobile.
 *
 * To use the vertical stepper with the contained content as seen in spec examples,
 * you must use the `<StepContent>` component inside the `<Step>`.
 *
 * <small>(The vertical stepper can also be used without `<StepContent>` to display a basic stepper.)</small>
 */

const styles = {
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'left',
    },
    gridList: {
        width: 1200,
        height: 750,
        marginBottom: 10,
        overflowY: 'auto',
        borderBox: 5
    },
    block: {
        maxWidth: 250,
    },
    checkbox: {
        marginBottom: 16,
    },
};


class GlobalFunctionsStepper extends Component {

    constructor(props) {
        super(props);
        this.onGlobalFunctionCall = this.props.onGlobalFunctionCall.bind(this);
        this.onBackButtonClick = this.props.onBackButtonClick.bind(this);
    }

    state = {
        finished: false,
        stepIndex: 0,
        open: false,
        selectedGlobalFunc: undefined,
        showStepper: true,

        selectedSourceVendor: 'Select Source Vendor',
        selectedSourceProduct: 'Select Source Product',

        selectedTargetVendor: 'Select Target Vendor',
        selectedTargetProduct: 'Select Target Product',
        selectedTargetMetric: 'Select Target Metric',
        selectedTargetMetricId: '',
        errorMessage:'',
        sourceProductList: [],
        targetProductList: [],

        availableTargetMetrics: [],
        allowSubmit:false
    };

    hideStepper = () => {
        this.setState({showStepper: false})
    };

    handleNext = () => {
        let productIds = [1];
        let targetLicenseMetric = this.props.targetLicenseMetric;
        let scenarioId = RequestUtil.get("scenarioId");
        let functionType = this.props.functionType;
        const {stepIndex} = this.state;
        this.setState({
            stepIndex: stepIndex + 1,
            finished: stepIndex >= 2,
        });
        if (this.state.stepIndex === 0 && this.props.functionType === undefined) {

            ToastFactory.notify(`please select the global function!`);
            this.setState({stepIndex: 0})
        }

        if (this.state.stepIndex === 1) {


           let SP = this.checkIfRequired(this.state.selectedSourceProduct);
           let TM = this.checkIfRequired(this.state.selectedTargetMetric);

           if(SP == false && TM == false){
                 this.setState({allowSubmit:true})
                 this.onGlobalFunctionCall(this.state.selectedSourceProduct, this.state.selectedTargetMetricId);
           }
           else{
            this.setState({stepIndex:1,errorMessage:'Please select values for all the fields'})
           }
        }

        if (this.state.stepIndex === 2) {
            this.props.handleClose();
        }

    };

    handlePrev = () => {
       this.onBackButtonClick()
        const {stepIndex} = this.state;
        if (stepIndex > 0) {
            this.setState({stepIndex: stepIndex - 1});
        }
        console.log("back button clicked!!!")

    };

    handleTouchTap = (event) => {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };

    handleRequestClose = () => {
        this.setState({open: false});
    };

    getLabel = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return 'Next';
            case 1 :
                return 'Simulate';
            case 2:
                return 'Ok'
        }
    };

    renderStepActions(step) {
        const {stepIndex} = this.state;
        let l = this.getLabel(stepIndex);
        return (
            <div style={{margin: '12px 0'}}>
                <RaisedButton
                    label={l}
                    disableTouchRipple={true}
                    disableFocusRipple={true}
                    primary={true}
                    onTouchTap={this.handleNext}
                    style={{marginRight: 12}}
                    className="stepperButton"
                />
                {step > 0 && (
                    <FlatButton
                        label="Back"
                        disabled={stepIndex === 0}
                        disableTouchRipple={true}
                        disableFocusRipple={true}
                        onTouchTap={this.handlePrev}
                        className="stepperButton"
                    />
                )}
            </div>
        );
    }

    getSelectedGlobalFunc() {
        return (this.state.selectedGlobalFunc === undefined) ? "Select Global Function" : this.state.selectedGlobalFunc
    }

    sourceVendorChanged(vendor) {
        let newVendorObj = VendorProductService.getSelectedObj(this.props.sourceVendorList, vendor);
        this.setState({
            selectedSourceVendor: newVendorObj.name, selectedSourceProduct: 'Select Source Product'
        });
        this.getSourceProductList(this.props.vendorProductInUse, newVendorObj.id)
        this.showIfSelected(this.state.selectedSourceVendor)
    }

    targetVendorChanged(vendor) {
        let newVendorObj = VendorProductService.getSelectedObj(this.props.targetVendorList, vendor);
        this.setState({
            selectedTargetVendor: newVendorObj.name, availableTargetMetrics: [],
            selectedTargetProduct: 'Select Target Product', selectedTargetMetric: 'Select Target Metric'
        });
        this.getTargetProductList(this.props.metrics, newVendorObj.id)
        this.showIfSelected(this.state.selectedTargetVendor)
    }

    targetProductChanged(productId) {
        let newProductObj = VendorProductService.getSelectedObj(this.state.targetProductList, productId);
        let availableMetricList = VendorProductService.getAvailableMetricList(this.state.targetProductList, productId);
        this.setState({
            selectedTargetProduct: newProductObj.name, selectedTargetProductId: newProductObj.id,
            selectedTargetMetric: 'Select Target Metric', availableTargetMetrics: availableMetricList
        });

        this.showIfSelected(this.state.selectedTargetProduct)
    }

    targetMetricChanged(targetMetric) {
        let newTargetMetricObj = VendorProductService.getSelectedObj(this.state.availableTargetMetrics, targetMetric);
        this.setState({
            selectedTargetMetric: newTargetMetricObj.name, selectedTargetMetricId: newTargetMetricObj.id
        });
          this.showIfSelected(this.state.selectedTargetMetric)

    }

    sourceProductChanged(productId) {
        let newProductObj = VendorProductService.getSelectedObj(this.state.sourceProductList, productId);
        this.setState({selectedSourceProduct: newProductObj.name})
    }

    getSourceProductList(metrics, vendorId) {
        let productList = VendorProductService.getProductList(metrics, vendorId);
        this.setState({sourceProductList: productList})
    }

    getTargetProductList(metrics, vendorId) {
        let productList = VendorProductService.getProductList(metrics, vendorId);
        this.setState({targetProductList: productList})
    }

    getColor(){
                return (this.state.allowSubmit == false) ? 'white':'red'
            }

    showIfSelected(selectedItem){
    // this method returns a green tick material ui icon when the field is selected with some value

    let color = this.getColor()
    return startsWith(selectedItem,'Select') ? <Required color={color} /> : <Done color='green' className='selectedField'/>
    }

    checkIfRequired(selectedItem){
    return startsWith(selectedItem,'Select')
    }

    submitClicked(){
    this.checkIfRequired(this.state.selectedSourceVendor);
    this.checkIfRequired(this.state.selectedSourceProduct);
    }
    showResult() {
        let mixedData = this.props.globalSimulationResult;


        if (!this.props.globalSimulationResult){
            return <Spinner/>}
        else {
             function getLicenseType(cell,row){

              let name = row.values[0].name
              return name
             }


            function getCost(cell,row){
             let cost = row.values[0].cost
             return '$' + cost.toLocaleString()
            }



             let currentMetricData = mixedData[0].totalProductDemands.map(function (f) {

                                return {
                                    name: f.licenseTypeName,
                                    demand: f.currentDemand,
                                    cost:f.currentCost
                                }
                            });

            let targetMetricData = mixedData[1].totalProductDemands.map(function(f){
                return {
                                name: f.licenseTypeName,
                                demand: f.simulatedDemand,
                                cost:f.simulatedCost
                        }
            });


            let data = [
                {
                    key: "Current Cost",
                    values: currentMetricData
                },
                {
                    key: "Simulated Cost",
                    values: targetMetricData
                }

            ];
            function getTotalLabel(){

            let totalLabel = ''
             if (currentMetricData[0].cost > targetMetricData[0].cost){
                totalLabel = 'Total Savings'
            }

            if (currentMetricData[0].cost < targetMetricData[0].cost){
                totalLabel = 'Total Upcharge'
            }

                return totalLabel
            }

            function findDiff(){
             let diff = Utils.findDifferenceBetween(currentMetricData[0].cost, targetMetricData[0].cost);



            return diff.toLocaleString()
            }

            return (<div>
                    <Panel header="Simulation Summary">
                       <BootstrapTable data={data}>
                           <TableHeaderColumn isKey={true}  dataField='key' width='50%'> Costs </TableHeaderColumn>
                          <TableHeaderColumn dataFormat={getLicenseType} width='25%'>License Metric</TableHeaderColumn>
                          <TableHeaderColumn dataFormat={getCost} width='25%' className='gmcColumn'>Costs</TableHeaderColumn>
                       </BootstrapTable>
                       <hr/>
                        <h3 className='totals'>{getTotalLabel()} <strong>$ {findDiff()}</strong></h3>
                    </Panel>
                    <Panel header="Simulation Result">
                        <div id="visualization-chart" className="m-0 row tile-body-result table-custom ht-100-per">
                            <SimResultBarChart data={this.props.globalSimulationResult} height="275"/>
                        </div>
                    </Panel>



                    </div>)
        }
    }

    getStepContent(stepIndex) {
        self = this;
        let selectedGlobalFunc = this.getSelectedGlobalFunc();
        let globalFunctionList = this.props.availableGlobalFunctions;

        let selectedSourceVendor = VendorProductService.getSelectedVendor(this.state.selectedSourceVendor);
        let selectedSourceProduct = VendorProductService.getSelectedProduct(this.state.selectedSourceProduct);

        let selectedTargetVendor = VendorProductService.getSelectedVendor(this.state.selectedTargetVendor);
        let selectedTargetProduct = VendorProductService.getSelectedProduct(this.state.selectedTargetProduct);
        let selectedTargetMetric = VendorProductService.getSelectedTargetMetric(this.state.selectedTargetMetric);

        let sourceVendorSelected = this.showIfSelected(selectedSourceVendor)
        let sourceProductSelected= this.showIfSelected(selectedSourceProduct)
        let targetVendorSelected = this.showIfSelected(selectedTargetVendor)
        let targetProductSelected = this.showIfSelected(selectedTargetProduct)
        let targetMetricSelected = this.showIfSelected(selectedTargetMetric)


        switch (stepIndex) {
            case 0:
                return (
                    <div className="first-step-div">
                        <p>Which global function would you like to run?</p>
                        <RaisedButton
                            labelStyle={{'fontSize': '18px'}}
                            onTouchTap={this.handleTouchTap}
                            label={selectedGlobalFunc} style={{height: '100%'}}
                            icon={<FunctionIcon/>}

                        />
                        <Popover
                            open={self.state.open}
                            anchorEl={this.state.anchorEl}
                            anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                            targetOrigin={{horizontal: 'left', vertical: 'top'}}
                            onRequestClose={self.handleRequestClose}>
                            <Menu>
                                {globalFunctionList.map((m, i) => {
                                    return (
                                        <MenuItem key={i} primaryText={m.name}
                                                  onClick={() => {
                                                      self.props.onGlobalFunctionSelect(m.name);
                                                      self.setState({selectedGlobalFunc: m.name});
                                                      self.handleRequestClose();
                                                  }}
                                                  style={{'fontSize': '18px'}}
                                        />
                                    )
                                })}
                            </Menu>
                        </Popover>
                        {this.renderStepActions(0)}
                    </div>);
            case 1:
                return (<div className="drop-down-div">
                    <Panel>

                        <div className="col-lg-6">
                            <Panel header="Select source vendor and product">
                                <div className="drop-down-div">
                                    <SelectionDropdown objList={this.props.sourceVendorList}
                                                       selectedField={selectedSourceVendor}
                                                       onSelectionChange={(vendor) => self.sourceVendorChanged(vendor)}/> {sourceVendorSelected}
                                </div>
                                <div className="drop-down-div">
                                    <SelectionDropdown objList={this.state.sourceProductList}
                                                       selectedField={selectedSourceProduct}
                                                       onSelectionChange={(sourceProduct) => self.sourceProductChanged(sourceProduct)}/> {sourceProductSelected}
                                </div>

                            </Panel>

                        </div>
                        <div>

                        </div>
                        <div className="col-lg-6">
                            <Panel header="Select target vendor,product and license metric" className="class=“col-lg-6">
                                <div className="drop-down-div">
                                    <SelectionDropdown objList={this.props.targetVendorList}
                                                       selectedField={selectedTargetVendor}
                                                       onSelectionChange={(vendor) => self.targetVendorChanged(vendor)}/> {targetVendorSelected}
                                </div>
                                <div className="drop-down-div">
                                    <SelectionDropdown objList={this.state.targetProductList}
                                                       selectedField={selectedTargetProduct}
                                                       onSelectionChange={(targetProduct) => self.targetProductChanged(targetProduct)}/> {targetProductSelected}
                                </div>

                                <div className="drop-down-div">
                                    <SelectionDropdown objList={this.state.availableTargetMetrics}
                                                       selectedField={selectedTargetMetric}
                                                       onSelectionChange={(targetMetricId) => {self.targetMetricChanged(targetMetricId)
                                                      }
                                                       }/> {targetMetricSelected}
                                </div>
                            </Panel>

                        </div>

                    </Panel>
                    <Panel>
                        <div className="col-lg-6">
                            {this.renderStepActions(1)}
                        </div>
                        <div className="col-lg-6">
                            <Checkbox
                                className="mock-chk-bx"
                                label="MockIL"
                                style={styles.checkbox}
                                onCheck={self.props.onCheckBoxChange}
                            />
                        </div>
                    </Panel>
                     <p style={{'color':'red','fontSize':'12px'}}>* {this.state.errorMessage}</p>
                </div>);
            case 2:
                return (<div className="second-step-div" id="resultMultibarChart">
                    <p><strong>Selected Product :</strong> {this.state.selectedSourceProduct} </p>
                    <p><strong>Target Metric:</strong> {this.state.selectedTargetMetric} </p>
                    {this.showResult()}
                    {this.renderStepActions(2)}
                </div>);
            default:
                return 'You\'re a long way from selection steps';
        }
    }

    render() {
        const {finished, stepIndex} = this.state;
        return (
            <div className="glob-div">
                <Stepper activeStep={stepIndex} connector={<ArrowForwardIcon/>}>
                    <Step completed={false}>
                        <StepLabel style={{'fontSize': '24px'}}>Select the global function</StepLabel>
                    </Step>
                    <Step completed={false}>
                        <StepLabel style={{'fontSize': '24px'}}>Select the source product and target metric
                            information </StepLabel>
                    </Step>
                    <Step completed={false}>
                        <StepLabel style={{'fontSize': '24px'}}>Simulation Result</StepLabel>
                    </Step>
                </Stepper>
                <div style={{margin: '0 16px'}}>
                    {this.getStepContent(stepIndex)}
                </div>
            </div>
        );
    }
}

const getResult = (state) => {
    return (!state.ui.globalSimulationResult) ? null : state.ui.globalSimulationResult.affectedProducts
};


const mapStateToProps = (state, ownProps) => {
    return {
        vendorProductInUse: state.vendorProductInUse,
        targetMetricId: state.simulationRequest.targetMetricId,
        targetLicenseMetric: state.ui.targetLicenseMetric,
        functionType: state.ui.globalFunction,
        availableGlobalFunctions: [{name: "Global Metric Change"}, {name: "Global product change"}],
        globalSimulationResult: getResult(state),
        sourceVendorList: VendorProductService.getVendorList(state.vendorProductInUse),
        targetVendorList: VendorProductService.getVendorList(state.metrics),
        metrics: state.metrics
    }
};

const mapDispatchToProps = (dispatch, ownProps) => {

    const onCheckBoxChange = () => {
        dispatch({type: Action.SET_MOCK_GLOBAL_SIMULATION});
    };

    const onGlobalFunctionSelect = (selectedGlobalFunc) => {
        dispatch({type: Action.GLOBAL_FUNCTION_SELECTED, selectedGlobalFunc});
    };

    const onGlobalFunctionCall = (sourceProductName, targetMetricId) => {
        dispatch(globalMetricChangeStartActionCreator(sourceProductName, targetMetricId))
    };

    return {
        onGlobalFunctionSelect: onGlobalFunctionSelect,
        onGlobalFunctionCall: onGlobalFunctionCall,
        onCheckBoxChange: onCheckBoxChange,
        onBackButtonClick:globalMetricChangeEndActionCreator
    }
};


GlobalFunctionsStepper = connect(mapStateToProps, mapDispatchToProps)(GlobalFunctionsStepper);


GlobalFunctionsStepper.propTypes = {
    availableGlobalFunctions: PropTypes.array,
    globalSimulationResult: PropTypes.object,
    selectedProduct: PropTypes.string,
    functionType: PropTypes.string,
    onGlobalFunctionSelect: PropTypes.func,
    onGlobalFunctionCall: PropTypes.func
};

export default GlobalFunctionsStepper;