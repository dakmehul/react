import React, {Component, PropTypes} from 'react';
import {Modal, ModalBody, ModalClose, ModalFooter, ModalHeader, ModalTitle} from "react-modal-bootstrap";
import Button from 'react-bootstrap/lib/Button';
import "./confirmation-model.scss";


class ConfirmationModal extends Component {
    constructor(props) {
        super(props);
        this.handleYes = this.handleYes.bind(this);
    }

    handleYes() {
        this.props.action();
        this.props.hideAlert();
    }

    render() {
        return (<Modal isOpen={this.props.isOpen} onRequestHide={this.props.hideAlert}>
                <ModalHeader>
                    <ModalClose onClick={this.props.hideAlert}/>
                    <ModalTitle><strong>{this.props.messageTitle}</strong></ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {this.props.children}
                </ModalBody>
                <ModalFooter>
                    <div className="mdl-footer-div">
                        <Button onClick={this.handleYes} bsStyle="info"> Yes</Button>
                        <Button onClick={this.props.hideAlert} bsStyle="default">No</Button>
                    </div>
                </ModalFooter>
            </Modal>
        )
    }
}


ConfirmationModal.propTypes = {
    isOpen: PropTypes.bool,
    messageTitle: PropTypes.string,
    message: PropTypes.string,
    action: PropTypes.func.isRequired,
    hideAlert: PropTypes.func
};

export default ConfirmationModal
