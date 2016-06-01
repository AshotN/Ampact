import { Component } from 'react'
import Sidebar from 'react-sidebar'

module.exports = class App extends Component {
	constructor (props) {
		super(props)
    this.state = {
      sidebarOpen: false
    }
	}

  onSetSidebarOpen (open) {
    this.setState({sidebarOpen: open});
  }

	render () {
    var sidebarContent = <b>Sidebar content</b>;
    return (
      <Sidebar sidebar={sidebarContent}
       open={this.state.sidebarOpen}
       onSetOpen={this.onSetSidebarOpen}>
        <div>
          <p>
            Hello, <input type="text" placeholder="Your name here" />!
          </p>
          <p>
            Sup
          </p>
        </div>
      </Sidebar>

    );
	}
}
