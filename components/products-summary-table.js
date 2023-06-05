import React, {Component, PropTypes} from "react";
import {BootstrapTable, TableHeaderColumn} from "react-bootstrap-table";
import Utils from "../common/utils"

class ProductsSummaryTable extends Component {


    render() {

        function getCurrentCost(cell, row) {
            return '$' + row.currentCost.toLocaleString()
        }

        function getLicenseTypeName(cell, row) {
            return <BootstrapTable data={row.totalProductDemand}>
                <TableHeaderColumn dataField='licenseTypeName' width='20%'>License Metric</TableHeaderColumn>
                <TableHeaderColumn dataField='currentDemand' isKey={true} width='20%'>Current Demand</TableHeaderColumn>
                <TableHeaderColumn dataField='simulatedDemand' width='20%'>Simulated Demand</TableHeaderColumn>
                <TableHeaderColumn dataField='currentCost' dataFormat={getCurrentCost} width='20%'>Current
                    Cost</TableHeaderColumn>
                <TableHeaderColumn dataField='simulatedCost' dataFormat={getSimulatedCost} width='20%'>Simulated
                    Cost</TableHeaderColumn>
            </BootstrapTable>
        }

        function getSimulatedCost(cell, row) {
            let simulatedCost = row.simulatedCost;
            let currentCost = row.currentCost;
            let diff = Utils.findDifferenceBetween(currentCost, simulatedCost);
            if (simulatedCost > currentCost) {
                return `$ ${simulatedCost.toLocaleString()} <i class='glyphicon glyphicon-arrow-up up-arrow'></i> (+$ ${diff.toLocaleString()})`
            }
            if (simulatedCost < currentCost) {
                return ` $ ${simulatedCost.toLocaleString()} <i class='glyphicon glyphicon-arrow-down down-arrow'></i> (-$ ${diff.toLocaleString()})`
            }
            return '$ ' + simulatedCost.toLocaleString()
        }


        return (
            <BootstrapTable data={this.props.affectedProducts}>
                <TableHeaderColumn dataField='productName' isKey={true} width='20%'>Product Name</TableHeaderColumn>
                <TableHeaderColumn dataFormat={getLicenseTypeName} width='80%'>License Metrics in
                    use</TableHeaderColumn>
            </BootstrapTable>
        );
    }
}

export default ProductsSummaryTable

ProductsSummaryTable.propTypes = {
    affectedProducts: PropTypes.array
};
