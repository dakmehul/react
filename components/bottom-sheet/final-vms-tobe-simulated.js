import React, {Component} from "react";
import PreparedSimulationsTable from "../prepared-simulations-table";
import reduxStore from "../../store";
import Action from "../../actions";
import Checkbox from "material-ui/Checkbox";
import ReactBottomSheet from "react-bottomsheet";
import SimulateButtonContainer from "../simulate-button-container";
import {removeSimulationCreator} from "../action-creators/simulation-action-creator";
import './final-vms-tobe-simulated.scss'
import Badge from 'material-ui/Badge';

const styles = {
    block: {
        maxWidth: 250,
    },
    checkbox: {
        marginBottom: 16,
    },
};

class FinalVMsToBeSimulated extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <ReactBottomSheet visible={this.props.bottomSheetVisible} onClose={this.props.closeBottomSheet}>
                    <div id="simulationListButton" className="simulate-list-btn">
                        <Badge badgeContent={this.props.simulationsTotal} secondary={true} className="badgeLocation-btmsheet"/>
                        <SimulateButtonContainer/>
                    </div>
                    <div>
                        <h2 className='title'> VMs selected for the simulation</h2>
                        <div>
                            <button
                                className="btn btn-danger btn-rounded btn-ef btn-ef-7 btn-ef-7h mb-10 removeVMList"
                                onClick={
                                    () => {
                                        reduxStore.dispatch({
                                            type: Action.REMOVE_SIMULATION_REQUESTS
                                        });
                                        close();
                                    }}><i className="fa fa-trash"/> Delete All
                            </button>
                            <Checkbox
                                className="mock-chk-bx"
                                label="MockIL"
                                style={styles.checkbox}
                                onCheck={this.props.onCheckBoxChange}
                            />
                        </div>
                    </div>
                    <PreparedSimulationsTable removeSimulation={removeSimulationCreator}
                                              simulations={this.props.simulations}/>
                </ReactBottomSheet>
            </div>);
    }
}
export default FinalVMsToBeSimulated