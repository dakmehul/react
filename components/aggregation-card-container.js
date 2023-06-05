import {connect} from "react-redux";
import AggregationCard from "./common/aggregation-card";

const mapStateToProps = (state) => {
    return {
        label: 'Total Hosts',
        aggregationValue:5000,
        colorClass:'bg-greensea'
    }
};

const AggregationCardContainer = connect(mapStateToProps)(AggregationCard);

export default AggregationCardContainer