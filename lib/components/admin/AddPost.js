'use strict';

var slugify = require('http-slug');
var assign = require('object-assign');

module.exports = function(tollan) {
	var React = tollan.React;
	var Router = tollan.Router;
	var forms = tollan.newforms;

	var postStore = tollan.getStore('blog/postStore');
	var form = require('forrrm')(React);
	var TextInput = form.TextInput;
	var Toast = form.Toast;

	return React.createClass({
		propTypes: {
			visible: React.PropTypes.bool,
			onPostCreated: React.PropTypes.func,
			onCancel: React.PropTypes.func
		},
		getInitialState: function() {
			return {
				title: '',
				valid: false,
				processing: false,
				errors: {}
			};
		},
		validate: function validate(newData) {
			var data = assign(this.state, newData);
			var errors = {};
			if (data.title.length < 1) {
				errors.title = ['Title is required'];
			} else if (data.title.length > 50) {
				errors.title = ['Title must be less than 50 characters'];
			} else if (!errors.title) {
				postStore.getAll().forEach(post => {
					if (post.slug === slugify(data.title)) {
						errors.slug = ['Slug must be unique'];
					}
				});
			}
			this.setState(assign({
				valid: Object.keys(errors).length ? false : true,
				errors: errors
			}, newData));
		},
		onTitleChange: function(newTitle) {
			this.validate({title: newTitle});
		},
		onFormSubmit: function(e) {
			e.preventDefault();
			this.setState({processing: true});
			var data = {slug: slugify(this.state.title), title: this.state.title};
			console.log(data);
			tollan.postAction('blog/addPost', data)
				.then(response => {
					if (response.statusCode === 200) {
						this.setState(this.getInitialState());
						postStore.load(); // Reload the entire tag store, easier than updating it
						if (this.props.onPostCreated) {
							this.props.onPostCreated();
						}
					} else {
						this.setState({processing: false, errorText: 'Error: ' + response.statusCode + ' ' + response.body.errorText});
					}
				}).catch(err => {
					this.setState({processing: false, errorText: 'Error (code: ' + err.message + ')'});
				});
		},
		componentDidMount: function() {
			this.refs.titleInput.focus();
		},
		render: function() {
			var slug = slugify(this.state.title);
			var submitValue = <span>Create Post</span>;

			if (this.state.processing) {
				submitValue = (
					<span>
						<i className="fa fa-circle-o-notch fa-spin"></i>&nbsp;Working...
					</span>
				);
			}

			var errorComponent = null;
			if (this.state.errorText) {
				errorComponent = <div className="Alert-error">{this.state.errorText}</div>;
			}

			return (
				<div className="ModalDialog">
					<div className="inner">
						<h2>Add a new post</h2>
						<form action="" method="POST" onSubmit={this.onFormSubmit} onChange={this.onFormChange}>
							{errorComponent}
							<TextInput label="Title" name="title" placeholder="Enter a title less than 50 characters" value={this.state.title} onChange={this.onTitleChange} errorText={this.state.errors.title} ref="titleInput" />
							<TextInput label="Slug" name="slug" placeholder="[autogenerated]" readOnly={true} value={slug} errorText={this.state.errors.slug} />
							<div className="buttons">
								<button type="submit" className="Button-blue" disabled={!this.state.valid || this.state.processing}>
									{submitValue}
								</button>
								<button className="Button-light" onClick={this.onCancel}>Cancel</button>
							</div>
						</form>
					</div>
				</div>
			);
		},
		onCancel: function(e) {
			e.preventDefault();
			this.setState(this.getInitialState());
			if (this.props.onCancel) {
				this.props.onCancel();
			}
		}
	});
};