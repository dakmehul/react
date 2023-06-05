import React, {Component, PropTypes} from 'react'
import en_Us from '../common/i18n'
import AggregationCard from "./common/aggregation-card"

class MetricCards extends Component {

    getMetricsCards() {
        let data = this.props.metricSummaries;
        if (data) {
            return data.map((m, i) => {
                return (<div key={i + ''}>
                        <AggregationCard label={en_Us.fields[m.name]} aggregationValue={m.value} colorClass={i}/>
                        <br/>
                    </div>
                );
            })
        }
        else {
            return (
                <div>
                    <h1>No data found</h1>
                </div>
            )
        }
    }

    render() {
        return (
            <div>
                {this.getMetricsCards()}
            </div>
        );
    }
}

MetricCards.propTypes = {
    metricSummaries: PropTypes.array
};

export default MetricCards;