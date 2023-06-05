import React, {Component} from "react";
import en_Us from "../common/i18n";
import Chip from "material-ui/Chip";
import {blueGrey200, red900, white} from "material-ui/styles/colors";
import {greensea, lightblue} from "./../common/minovate-colors";
import "./filter-chip.scss";
const styles = {
    chip: {
        margin: 4,
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    }
};

class FilterChip extends Component {

    constructor(props) {
        super(props);
        this.onDelete = props.onDelete.bind(this);
        this.onToggle = props.onToggle.bind(this);
    }

   getFilterColor(filter){
     if (filter.negate){
        return red900
     }
     if(filter.mandatory)
         return lightblue;

     if (!filter.mandatory)
        return greensea
   }

    getRangeFilterChipLabel(filter){
    let rangeFilterLabel = ''
    let from = filter.from
    let to = filter.to
    if(filter.negate){
        rangeFilterLabel = <div><strong> {en_Us.fields[filter.field]}: </strong> NOT between {from}-{to}</div>
    }
    else{
           rangeFilterLabel = <div><strong> {en_Us.fields[filter.field]}: </strong>{from}-{to}</div>
     }
    return rangeFilterLabel
    }

    getFilterChipLabel(filter){
    let filterLabel = ''
    if(filter.negate && filter.filterWidget === 'RADIO'){
        filterLabel = <div><strong> {en_Us.fields[filter.field]}: </strong> NOT {filter.label}</div>
        return filterLabel
    }
    if(filter.negate && filter.filterWidget !=='RADIO'){
        filterLabel =  <div><strong> {en_Us.fields[filter.field]}: </strong>NOT {filter.value}</div>
        return filterLabel
    }

    if(!filter.negate && filter.filterWidget === 'RADIO'){
        filterLabel = <div><strong>{en_Us.fields[filter.field]} : </strong> {filter.label}</div>
        return filterLabel
    }
    return <div><strong> {en_Us.fields[filter.field]}: </strong>{filter.value}</div>

    }

    render() {
        let filter = this.props.filter;
        let filterColor = greensea;
        let labelColor = white;
        if (filter.mandatory) {

        } else if (filter.negate) {
            filterColor = red900;
            labelColor = blueGrey200;
        }

        let self = this;
        let props = {};

        if (!filter.mandatory) {
            props.onRequestDelete = () => self.onDelete(filter);
            props.onTouchTap = () => self.onToggle(filter.field)
        }

        if (filter.from || filter.to) {
            let from;
            let to;
            //TODO: Specific code - shouldn't be here. Please bring up such issues for discussion
            if (filter.field === "moveDate") {
                from = new Date(filter.from).toDateString();
                to = new Date(filter.to).toDateString();
            } else {
                from = filter.from;
                to = filter.to
            }
            return (
                <Chip {...props} style={styles.chip} backgroundColor={this.getFilterColor(filter)} labelColor={labelColor}>
                    {this.getRangeFilterChipLabel(filter)}
                </Chip>
            )
        }
        else {
            return (
                <Chip {...props} style={styles.chip} backgroundColor={this.getFilterColor(filter)} labelColor={labelColor}>
                        {this.getFilterChipLabel(filter)}
                </Chip>
            );

        }

    }
}

FilterChip.propTypes = {
    filter: React.PropTypes.object,
    onDelete: React.PropTypes.func,
    onToggle: React.PropTypes.func
};


export default FilterChip