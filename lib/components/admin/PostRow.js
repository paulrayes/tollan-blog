'use strict';

module.exports = function(tollan) {

	var Velocity = undefined;
	var PostForm = undefined;
	if (process.browser) {
		PostForm = require('./PostForm')(tollan);
	}
	/*if (!tollan.SERVER) {
		PostForm = require('./PostForm')(tollan);
		tollan.loadBundle('velocity-animate').then(() => {
			Velocity = require('velocity-animate');
		});
	}*/

	//var React = tollan.React;
	var form = require('forrrm')(React);
	var TextInput = form.TextInput;
	var Toast = form.Toast;

	return React.createClass({
		propTypes: {
			onPostDeleted: React.PropTypes.func,
			onPostDeleteFail: React.PropTypes.func,
			onPostSave: React.PropTypes.func,
			onPostSaveFail: React.PropTypes.func,
			post: React.PropTypes.object
		},
		getInitialState: function() {
			return {
				valid: false,
				errors: [],
				editing: false,
				processing: false,
				slug: '',
				title: '',
				displayed: false
			};
		},
		componentWillMount: function() {
			this.componentWillReceiveProps(this.props);
			require.ensure(['velocity-animate'], require => {
			//tollan.loadBundle('velocity-animate').then(() => {
				Velocity = require('velocity-animate');
			//});
			}, 'velocity-animate');
		},
		componentWillUnmount: function() {
			Velocity = undefined;
		},
		componentWillReceiveProps: function(nextProps) {
			this.setState({
				editing: false,
				slug: nextProps.post.slug,
				title: nextProps.post.title,
				displayed: nextProps.post.displayed
			});
		},
		// Velocity is hanging onto nodes for some reason? Why? Memory leak...
		componentWillEnter: function(next) {
			if (typeof Velocity === 'undefined') {
				return next();
			}
			var nodes = this.getDOMNode().childNodes;
			for (var i = 0; i < nodes.length; i++) {
				nodes[i].style.backgroundColor = '#fff3a5';
			}
			Velocity(
				nodes,
				{backgroundColorAlpha: [ 0 ]},
				{duration: 500, complete: () => {
					if (this.isMounted()) {
						next();
					}
				}}
			);
		},
/*
Custom velocity clearCache method, goes next to existing removeData method
Need to figure out how to use removeData
$.clearCache = function () {
  $.each(cache, function(key) {
      if (!cache[key].velocity.isAnimating) {
          delete cache[key];
      }
      //console.log(cache[key].velocity.isAnimating);
  });
};
*/
		componentWillLeave: function(next) {
			if (typeof Velocity === 'undefined') {
				return next();
			}
			var node = this.getDOMNode();
			Velocity(
				node,
				{backgroundColor: [ '#fcc' ]},
				{duration: 200}
			);
			Velocity(
				node,
				{opacity: [ 0 ]},
				{duration: 500, complete: () => {
					//Velocity.Utilities.clearCache();
					if (this.isMounted()) {
						next();
					}
				}}
			);
		},
		/*componentDidUpdate: function(prevProps, prevState) {
			if (!prevState.editing && this.state.editing) {
				this.refs.titleInput.focus();
			}
		},*/
		render: function() {
			var post = this.props.post;
			if (this.state.editing) {
				var errorComponent = null;
				return <tr className="active">
					<td colSpan="4">
						<PostForm onSubmit={this.onEditSubmit} onCancel={this.onEditCancel} post={post} />
					</td>
				</tr>;
			} else {
				if (post.published) {
					var published = <i className="fa fa-eye" title="Yes"></i>;
				} else {
					var published = null;
				}
				return <tr>
						<td style={{width: '20%'}}>{post.slug}</td>
						<td style={{width: '40%'}}>{post.title}</td>
						<td style={{textAlign:"center", width: '20%'}}>{published}</td>
						<td style={{textAlign:"center", width: '20%'}}>
							<button className="IconButton" title="Edit" onClick={this.onEditClick}><i className="fa fa-edit"></i></button>
							<button className="IconButton" title="Delete" onClick={this.onDeleteClick}><i className="fa fa-trash-o"></i></button>
						</td>
					</tr>;
			}
		},
		onEditClick: function() {
			this.setState({editing: true, processing: false});
		},
		onEditCancel: function() {
			this.setState({editing: false});
		},
		onEditSubmit: function(post) {
			this.setState({processing: true});
			//console.log(post);
			//console.log(this.props.post);
			var data = post;//{slug: post.slug};
			/*for (var key in this.props.post) {
				if (post[key] !== this.props.post[key]) {
					data[key] = post[key];
				}
			}
			console.log(data);*/
			tollan.postAction('blog/editPost', data).then(response => {
					if (response.statusCode === 200) {
						this.setState({editing: false});
						if (this.props.onPostSave) {
							this.props.onPostSave();
						}
					} else {
						console.log(response);
						if (this.props.onPostSaveFail) {
							if (response.statusCode === 400) {
								this.props.onPostSaveFail(response.statusCode + ' ' + response.body.errorText);
							} else {
								this.props.onPostSaveFail(response.statusCode);
							}
						}
						this.setState({processing: false});//, errorText: 'Error (code: ' + response.statusCode + ')'});
					}
				}).catch(err => {
					console.log(err);
					if (this.props.onPostSaveFail) {
						if (typeof err.message !== 'undefined') {
							this.props.onPostSaveFail(err.message);
						} else if (typeof err.statusCode !== 'undefined') {
							this.props.onPostSaveFail(err.statusCode);
						} else {
							this.props.onPostSaveFail('Unknown error');
						}
					}
					this.setState({processing: false});//, errorText: 'Error (code: ' + err.message + ')'});
				});

		},
		onDeleteClick: function() {
			tollan.postAction('blog/deletePost', {slug: this.props.post.slug})
				.then(response => {
					if (response.statusCode === 200) {
						if (this.props.onPostDeleted) {
							this.props.onPostDeleted();
						}
					} else {
						if (this.props.onPostDeleteFail) {
							this.props.onPostDeleteFail(response.statusCode + ' ' + response.body.errorText);
						}
					}
				}).catch(err => {
					if (this.props.onPostDeleteFail) {
						this.props.onPostDeleteFail(err.message);
					}
				});
		}
	});
};
