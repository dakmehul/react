import "./spinner.scss";
import CircularProgress from "material-ui/CircularProgress";
import React from "react";

function Spinner(props) {
    let position = "center";
    if (props.position) {
        position = props.position;
    }
    return ( <div className={position}>
        <CircularProgress size={props.size || 60 } thickness={5}/>
    </div>)
}
export default Spinner;