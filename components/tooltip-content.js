import React, {Component, PropTypes} from 'react'
import CopyToClipboard from "react-copy-to-clipboard";

class TooltipContent extends Component {

    getFields() {
        let data = this.props.data;
        return Object.keys(data).map(function (key, index) {
            if (key === 'Running Products'){
                let runningProducts = data[key].value.map(function(f,i){
                            return <li key={i}> {f.name} </li>
                });
                return (<div key={index}>
                                    <label><strong>{key}</strong>: <ul>{runningProducts
                                    }</ul></label>
                    </div>
                    )};

            if (key === "id")
                return "";
            if (!data[key].copyEnabled) {
                return (<div key={index}><label><strong>{key}</strong>: {data[key].value}</label></div>)
            } else {
                return (<CopyToClipboard id="clipboard" key={index} text={data[key].value} onCopy={() => {
                    }}>
                                <span><strong>{key}</strong>: {data[key].value}
                                    <i className="fa fa-clipboard hover-icon" aria-hidden="true"/>
                                </span>
                    </CopyToClipboard>
                )
            }
        });
    }

    render() {
        return (
            <div>
                {this.getFields()}
            </div>
        );
    }
}

TooltipContent.propTypes = {
    data: PropTypes.object
};

export default TooltipContent;