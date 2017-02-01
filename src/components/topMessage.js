import { Component } from 'react'

class topMessage extends Component  {
    constructor(props) {
        super(props);
    }

    render () {

        let style = this.props.Message == null ? '0' : '35px';
        return (
            <div className='topMessage' style={{height: style}} >
                <div>{this.props.Message}</div>
            </div>
        )
    }
}

export default topMessage;