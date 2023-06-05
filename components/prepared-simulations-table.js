import React, {Component} from "react";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";

class PreparedSimulationsTable extends Component {
    render() {

        const options = {
            sizePerPage: 5
        };

        let self = this;

        function getActions(cell, row) {
            const deleteIcon = (
                <i className="fa fa-trash action-icon fg-danger" onClick={() => {
                    console.log('Row to be deleted:');
                    console.log(row);
                    console.log(self.props.removeSimulation);
                    self.props.removeSimulation(row);
                }}/>
            );

            return deleteIcon;
        }

        return (
            <BootstrapTable data={ this.props.simulations} pagination={true} options={ options}>
                <TableHeaderColumn dataField='vm' filter={ {type: 'TextFilter', delay: 100} } isKey={true} width='48%'>VM
                    Name</TableHeaderColumn>
                <TableHeaderColumn dataField='targetHost' filter={ {type: 'TextFilter', delay: 100} } width='48%'>Target
                    Host</TableHeaderColumn>
                <TableHeaderColumn dataFormat={getActions} dataAlign='center' width='4%'/>
            </BootstrapTable>
        );
    }
}


export default PreparedSimulationsTable

