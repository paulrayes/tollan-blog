'use strict';

module.exports = function(tollan) {

	if (tollan.SERVER) {
		var Velocity = null;
	} else {
		var Velocity = require('velocity-animate');
	}

	var React = tollan.React;
	return React.createClass({
		render: function() {
			var tag = this.props.tag;
			if (tag.displayed) {
				var displayed = <i className="fa fa-check" title="Yes"></i>;
			} else {
				var displayed = null;
			}
			return <tr>
					<td>{tag.slug}</td>
					<td>{tag.name}</td>
					<td style={{textAlign:"center"}}>{displayed}</td>
					<td style={{textAlign:"center"}}>
						<a href="#" className="IconButton" title="Edit"><i className="fa fa-pencil-square-o"></i></a>
						<a href="#" className="IconButton" title="Delete" onClick={this.onDeleteClick}><i className="fa fa-trash-o"></i></a>
					</td>
				</tr>;
		},
		componentWillEnter: function(next) {
			var nodes = this.getDOMNode().childNodes;
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].style.backgroundColor = '#fff3a5';
			}
			Velocity(
				nodes,
				{backgroundColorAlpha: [ 0 ]},
				{duration: 500, complete: next}
			);
		},
		componentWillLeave: function(next) {
			var node = this.getDOMNode();
			Velocity(
				node,
				{backgroundColor: [ '#fcc' ]},
				{duration: 200}
			);
			Velocity(
				node,
				{opacity: [ 0 ]},
				{duration: 500, complete: next}
			);
		},
		onDeleteClick: function() {
			tollan.postAction('blog/deleteTag', {slug: this.props.tag.slug})
				.then(response => {
					if (response.statusCode === 200) {
						if (this.props.onTagDeleted) {
							this.props.onTagDeleted();
						}
					} else {
						if (this.props.onTagDeleteFail) {
							this.props.onTagDeleteFail(response.statusCode);
						}
					}
				}).catch(err => {
					if (this.props.onTagDeleteFail) {
						this.props.onTagDeleteFail(err.message);
					}
				});

		}
	});
};
