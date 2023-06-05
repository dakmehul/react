import React, {Component} from "react";
import {Modal, ModalBody, ModalFooter, ModalClose, ModalHeader, ModalTitle} from "react-modal-bootstrap";
import {withRouter} from 'react-router';

class IlaModal extends Component {

    render() {
        return (<Modal isOpen={this.props.isOpen} onRequestHide={this.props.hideModal}>
                <ModalHeader>
                    <ModalClose onClick={this.props.hideModal} />
                    <ModalTitle>{this.props.title}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {this.props.children}
                </ModalBody>
                 <ModalFooter>
                     <button className='btn btn-default' onClick={this.props.hideModal}>
                          Close
                    </button>
                </ModalFooter>
            </Modal>
        )
    }
}

IlaModal.propTypes = {
    isOpen: React.PropTypes.bool,
    hideModal:React.PropTypes.func
};

export default withRouter(IlaModal)