import React, {Component, PropTypes} from "react";
import {greensea, lightblue, lightred, slategrey} from "./../../common/minovate-colors";
import {Card, CardTitle} from "material-ui/Card";

const cardColors = [greensea, lightred, lightblue, slategrey,greensea, lightred,];


class AggregationCard extends Component {
    render() {
        return (
            <Card containerStyle={{backgroundColor: cardColors[this.props.colorClass]}}>
                <CardTitle title={this.props.aggregationValue}
                           subtitle={this.props.label}
                           subtitleColor="white"
                           titleColor="white"/>
            </Card>
        )
    }
}

AggregationCard.propTypes = {
    label: PropTypes.string.isRequired,
    aggregationValue: PropTypes.number,
    colorClass: PropTypes.number
};

export default AggregationCard;
