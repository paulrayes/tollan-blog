'use strict';

module.exports = function(tollan) {

	if (tollan.SERVER) {
		var Velocity = null;
	} else {
		var Velocity = require('velocity-animate');
	}

	var React = tollan.React;
	var form = require('forrrm')(React);
	var TextInput = form.TextInput;
	var Toast = form.Toast;

	return React.createClass({
		getInitialState: function() {
			return {
				valid: false,
				errors: [],
				editing: false,
				processing: false,
				slug: '',
				name: '',
				displayed: false
			};
		},
		componentWillMount: function() {
			this.componentWillReceiveProps(this.props);
		},
		componentWillReceiveProps: function(nextProps) {
			this.setState({
				editing: false,
				slug: nextProps.tag.slug,
				name: nextProps.tag.name,
				displayed: nextProps.tag.displayed
			});
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
		componentDidUpdate: function(prevProps, prevState) {
			if (!prevState.editing && this.state.editing) {
				this.refs.nameInput.focus();
			}
		},
		render: function() {
			var tag = this.props.tag;
			if (this.state.editing) {
				var errorComponent = null;
				if (this.state.processing) {
					var buttons = <td style={{textAlign:"center"}}>
						<i className="fa fa-circle-o-notch fa-spin"></i>&nbsp;Working...
					</td>;
				} else {
					var buttons = <td style={{textAlign:"center", width: '20%'}}>
						<button className={this.state.valid?"IconButton":"IconButton IconButton-disabled"} title="Save" onClick={this.onSaveClick}><i className="fa fa-save"></i></button>
						<button className="IconButton" title="Cancel" onClick={this.onCancelClick}><i className="fa fa-close"></i></button>
					</td>;
				}
				return <tr className="active">
					<td style={{width: '20%'}}>
						<TextInput label="Slug" name="slug" message="Slug cannot be changed" readOnly={true} value={tag.slug} errorText={this.state.errors.slug} />
					</td>
					<td style={{width: '40%'}}>
						<TextInput label="Name" name="name" message="Enter a name less than 50 characters" value={this.state.name} onChange={this.onNameChange} errorText={this.state.errors.name} ref="nameInput" />
					</td>
					<td style={{textAlign:"center", width: '20%'}}>
						<button className="IconButton" title={this.state.displayed?"Yes":"No"} onClick={this.onDisplayedClick}><i className={this.state.displayed?"fa fa-eye":"fa fa-eye-slash"}></i></button>
					</td>
					{buttons}
				</tr>;
			} else {
				if (tag.displayed) {
					var displayed = <i className="fa fa-eye" title="Yes"></i>;
				} else {
					var displayed = null;
				}
				return <tr>
						<td style={{width: '20%'}}>{tag.slug}</td>
						<td style={{width: '40%'}}>{tag.name}</td>
						<td style={{textAlign:"center", width: '20%'}}>{displayed}</td>
						<td style={{textAlign:"center", width: '20%'}}>
							<button className="IconButton" title="Edit" onClick={this.onEditClick}><i className="fa fa-edit"></i></button>
							<button className="IconButton" title="Delete" onClick={this.onDeleteClick}><i className="fa fa-trash-o"></i></button>
						</td>
					</tr>;
			}
		},
		validate: function(newName) {
			var errors = {};
			if (newName.length < 1) {
				errors.name = ['Name is required'];
			} else if (newName.length > 50) {
				errors.name = ['Name must be less than 50 characters'];
			}
			this.setState({
				valid: Object.keys(errors).length ? false : true,
				errors: errors,
				name: newName
			});
		},
		onNameChange: function(newName) {
			this.validate(newName);
		},
		onDisplayedClick: function() {
			this.setState({displayed: !this.state.displayed});
		},
		onEditClick: function() {
			this.setState({editing: true, processing: false});
			this.validate(this.props.tag.name);
		},
		onCancelClick: function() {
			this.setState({editing: false});
		},
		onSaveClick: function() {
			if (!this.state.valid) {
				return;
			}
			this.setState({processing: true});
			var data = {
				slug: this.props.tag.slug,
				name: this.state.name
			};
			if (this.state.displayed !== this.props.tag.displayed) {
				data.displayed = this.state.displayed;
			}
			tollan.postAction('blog/editTag', data).then(response => {
					if (response.statusCode === 200) {
						this.setState({editing: false});
						if (this.props.onTagSave) {
							this.props.onTagSave();
						}
					} else {
						if (this.props.onTagSaveFail) {
							if (response.statusCode === 400) {
								this.props.onTagSaveFail(response.statusCode + ' ' + response.body.errorText);
							} else {
								this.props.onTagSaveFail(response.statusCode);
							}
						}
						console.log(response);
						this.setState({processing: false});//, errorText: 'Error (code: ' + response.statusCode + ')'});
					}
				}).catch(err => {
					if (this.props.onTagSaveFail) {
						this.props.onTagSaveFail(err.message);
					}
					this.setState({processing: false});//, errorText: 'Error (code: ' + err.message + ')'});
				});

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
