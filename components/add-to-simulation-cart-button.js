import {connect} from 'react-redux'
import Button from './common/button'
import VMService from '../services/vm-service'
import Action from '../actions'

const cartCreator = () => {
    return (dispatch, getState) => {
        const {vmRequest} = getState();
        const {productRequest} = getState();
        //        SimulationService.simulate(simulationRequest).then(function(response){
//              dispatch({type:Action.SIMULATION_SUCCESS, simulationResponse:response.simulationResponse})
//        })
        VMService.vms(vmRequest, productRequest).then(function (response) {
            dispatch({type: Action.VIEW_GRID, vmResponse: response.vmResponse})
            console.log(vmResponse);
        })
    }
};

const mapStateToProps = (state) => ({
    label: 'Get VMs'
});

const mapDispatchToProps = ({
    action: simulateCreator
});

const SimulateButton = connect(
    mapStateToProps,
    mapDispatchToProps
)(Button);

export default SimulateButton