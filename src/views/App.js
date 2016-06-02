import { Component } from 'react'
import Sidebar from 'react-sidebar'

// const defaultStyles = {
// 	wrapper: {
// 		backgroundColor: '#252527',
// 		height: '100%'
// 	},
// 	table: {
// 		width: '100%',
// 		color: 'white',
// 		textAlign: 'center',
// 		'td': {
// 			padding: '20px 0'
// 		}
// 	}
// };





module.exports = class App extends Component {
	constructor (props) {
		super(props)

		this.state = {
			sidebarOpen: true,
			docked: true,
			transitions: false
		}
	}



	render () {
		const sidebarContent = <div>Ampact</div>;

		let Song = [
			{
				Name: "AYY",
				Artist: "YOO",
				Album: "OHH"
			},
			{
				Name: "Name",
				Artist: "Artist",
				Album: "Album"
			},
			{
				Name: "Name",
				Artist: "Artist",
				Album: "Album"
			},
			{
				Name: "Name",
				Artist: "YOO",
				Album: "Album"
			}
		]
		let mainContent = 
											<div className='wrapper' /*style={defaultStyles.wrapper}*/>
												<table /*style={defaultStyles.table}*/>
													<thead>
														<tr>
															<th>Song</th>
															<th>Artist</th>
															<th>Album</th>
														</tr>
													</thead>
													<tbody>
														{Song.map(function(object, i){
      												 return <tr>
	      												  <td>{object.Name}</td>
	      												  <td>{object.Artist}</td>
	      												  <td>{object.Album}</td>
      												  </tr>
														})}
													</tbody>
												</table>
											</div>

							

		return (
			<Sidebar sidebar={sidebarContent}
			 open={this.state.sidebarOpen}
			 docked={this.state.docked}
			 transitions={this.state.transitions}>
				{mainContent}
			</Sidebar>

		);
	}
}
