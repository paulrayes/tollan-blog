'use strict';

var slugify = require('http-slug');
var assign = require('object-assign');

module.exports = function(tollan) {
	var React = tollan.React;
	var Router = tollan.Router;
	//var forms = tollan.newforms;

	var postStore = tollan.getStore('blog/postStore');
	var tagStore = tollan.getStore('blog/tagStore');
	var form = require('forrrm')(React);
	var TextInput = form.TextInput;
	var Checkbox = form.Checkbox;
	var TagList = form.TagList;
	var Toast = form.Toast;
	var Editor = require('forrrm')(React).Editor;
	var FileUploader = require('tollan-filemanager/build/components/FileUploader')(tollan);
	var FileList = require('tollan-filemanager/build/components/FileList')(tollan);

	return React.createClass({
		propTypes: {
			onSubmit: React.PropTypes.func,
			onCancel: React.PropTypes.func,
			post: React.PropTypes.object
		},
		getInitialState: function() {
			var state = {
				post: {
					slug: '',
					title: '',
					published: false,
					publishDate: 0,
					tags: []
				},
				//title: '',
				currentTab: 'general',
				valid: false,
				processing: false,
				errors: {},
				editing: typeof this.props.post !== 'undefined',
				tags: tagStore.getAll()
			};
			if (typeof this.props.post !== 'undefined') {
				state.post = assign({}, this.props.post); // copy
			}
			//debugger;
			if (!tollan.SERVER) {
				//console.log(this.props);
			}
			return state;
		},
		validate: function validate(newData) {
			var editing = this.state.editing;
			var data = assign(this.state.post, newData);
			if (!editing) {
				data.slug = slugify(data.title);
			}

			var errors = {};
			if (data.title.length < 1) {
				errors.title = ['Title is required'];
			} else if (data.title.length > 100) {
				errors.title = ['Title must be less than 100 characters'];
			} else if (!editing && !errors.title) {
				postStore.getAll().forEach(post => {
					if (post.slug === data.slug) {
						errors.slug = ['Slug must be unique'];
					}
				});
			}

			this.setState({
				valid: Object.keys(errors).length ? false : true,
				errors: errors,
				post: data
			});
		},
		onTitleChange: function(newTitle) {
			this.validate({title: newTitle});
		},
		onPublishedChange: function(newPublished) {
			this.validate({published: newPublished});
		},
		onTagsChange: function(newTags) {
			//console.log(newTags);
			this.validate({tags: newTags});
		},
		onContentChange: function(newContent) {
			this.validate({content: newContent});
		},
		onFormSubmit: function(e) {
			e.preventDefault();
			this.setState({processing: true});
			if (this.props.onSubmit) {
				this.props.onSubmit(this.state.post);
			}
		},
		componentDidMount: function componentDidMount() {
			tagStore.on('change', this.onStoreChange);
			tagStore.load();
			this.refs.titleInput.focus();
		},
		componentWillUnmount: function componentWillUnmount() {
			tagStore.removeListener('change', this.onStoreChange);
		},
		onStoreChange: function() {
			this.setState({tags: tagStore.getAll()});
		},
		render: function() {
			var submitValue = <span>Create Post</span>;

			if (this.state.processing) {
				submitValue = (
					<span>
						<i className="fa fa-circle-o-notch fa-spin"></i>&nbsp;Working...
					</span>
				);
			} else if (this.state.editing) {
				submitValue = <span>Save Post</span>;
			}

			var errorComponent = null;
			if (this.state.errorText) {
				errorComponent = <div className="Alert-error">{this.state.errorText}</div>;
			}

			if (this.state.currentTab === 'general') {
				if (tagStore.loaded) {
					var tagList = <TagList label="Tags" name="title" tags={this.state.tags} selected={this.state.post.tags} onChange={this.onTagsChange} errorText={this.state.errors.title} message="Enter tags separated by commas" ref="tagsInput" />;
				} else {
					var tagList = <span>Tags loading...</span>;
				}
				var tabContent = <div>
						<TextInput label="Title" name="title" placeholder="Enter a title less than 50 characters" value={this.state.post.title} onChange={this.onTitleChange} errorText={this.state.errors.title} ref="titleInput" />
						<TextInput label="Slug" name="slug" placeholder="[autogenerated]" readOnly={true} value={this.state.post.slug} errorText={this.state.errors.slug} />
						<Checkbox label="Published" name="published" checked={this.state.post.published} errorText={this.state.errors.published} onChange={this.onPublishedChange} />
						{tagList}
					</div>;
			} else if (this.state.currentTab === 'content') {
				var tabContent = <div>
						<Editor label="Content" name="content" placeholder="Enter the post content" value={this.state.post.content} onChange={this.onContentChange} errorText={this.state.errors.content} />
					</div>;
			} else if (this.state.currentTab === 'files') {
				var tabContent = <div>
						<FileUploader prefix={'blog/post/' + this.state.post.slug} />
						<FileList prefix={'blog/post/' + this.state.post.slug} />
					</div>;
			}

			return (
				<form action="" method="POST" onSubmit={this.onFormSubmit} onChange={this.onFormChange}>
					<ul className="Tabs">
						<li className={this.state.currentTab==='general'?'active':''}><a href="#" onClick={this.onTabClick} data-tab="general">General</a></li>
						<li className={this.state.currentTab==='content'?'active':''}><a href="#" onClick={this.onTabClick} data-tab="content">Content</a></li>
						<li className={this.state.currentTab==='files'?'active':''}><a href="#" onClick={this.onTabClick} data-tab="files">Files</a></li>
					</ul>
					<div className="TabsContent">
						{errorComponent}
						{tabContent}
						<div className="buttons">
							<button type="submit" className="Button-blue" disabled={!this.state.valid || this.state.processing}>
								{submitValue}
							</button>
							<button className="Button-light" onClick={this.onCancel}>Cancel</button>
						</div>
					</div>
				</form>
			);
			/*return (
				<div className="ModalDialog">
					<div className="inner">
						<h2>Add a new post</h2>
						<form action="" method="POST" onSubmit={this.onFormSubmit} onChange={this.onFormChange}>
							{errorComponent}
							<TextInput label="Title" name="title" placeholder="Enter a title less than 50 characters" value={this.state.post.title} onChange={this.onTitleChange} errorText={this.state.errors.title} ref="titleInput" />
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
			);*/
		},
		onTabClick: function(e) {
			e.preventDefault();
			this.setState({currentTab: e.target.dataset.tab});
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
