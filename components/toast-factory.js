import React from 'react'
import {toast} from "react-toastify";


function Msg(props) {
    return(
        <p className="text-lg fontBold">{props.text}</p>
    );
}

const FontAwesomeCloseButton = ({ closeToast }) => (
  <i
    className="toastify__close fa fa-times"
    onClick={closeToast}
  />
);

class ToastFactory{
    success(text){
        toast(<Msg text={text}/>, {type: toast.TYPE.SUCCESS});
    }

    notify(text){
        toast(<Msg text={text} closeButton= {<FontAwesomeCloseButton/>} autoClose= {3000} />,{type:toast.TYPE.INFO})
    }

    error(text){
        toast(<Msg text={text} closeButton= {<FontAwesomeCloseButton/>} autoClose={false} />,{type:toast.TYPE.ERROR});
    }
}

export default new ToastFactory()