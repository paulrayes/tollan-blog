'use strict';

var slugify = require('http-slug');

//module.exports = function(tollan) {
	//var React = tollan.React;
	//var Router = tollan.Router;
	//var forms = tollan.newforms;

	var postStore = tollan.getStore('blog/postStore');
	var form = require('forrrm')(React);
	var TextInput = form.TextInput;
	var Toast = form.Toast;

	if (tollan.SERVER) {
		var PostForm = null;
	} else {
		var PostForm = require('./PostForm');
	}

	var AddPost = require('./AddPost');
	var PostRow = require('./PostRow');
	//var PostForm = require('./PostForm');
	var ReactTransitionGroup = React.addons.TransitionGroup;

	module.exports = React.createClass({
		getInitialState: function getInitialState() {
			return {
				post: {},
				addPostVisible: false,
				toastVisible: false
			}
		},
		componentDidMount: function componentDidMount() {
			postStore.on('change', this.onStoreChange);
			postStore.load();
		},
		componentWillUnmount: function componentWillUnmount() {
			postStore.removeListener('change', this.onStoreChange);
		},
		onStoreChange: function() {
			this.setState({posts: postStore.getAll()});
		},
		render: function() {
			var posts = [];
			this.state.posts.forEach(post => {
				//console.log(this.state.posts);
				posts.push(
					<PostRow key={post.slug} post={post} onPostDeleted={this.onPostDeleted} onPostDeleteFail={this.onPostDeleteFail} onPostSave={this.onPostSave} onPostSaveFail={this.onPostSaveFail} />
				);
			});
			var addPost = null;
			if (this.state.addPostVisible) {
				addPost = <div className="ModalDialog">
					<div className="inner">
						<h2>Add a new post</h2>
						<PostForm onSubmit={this.onCreatePostSubmit} onCancel={this.onPostCreateCancel} />
					</div>
				</div>;
			}

			return (
				<div className="AdminContent">

					<section className="Panel">

						<div className="Toolbar">
							<h1>Blog Posts</h1>
							<div className="Toolbar-right">
								<button className="Button-red" onClick={this.onCreatePostClick}><i className="fa fa-plus Tooltip"></i> Create Post</button>
							</div>
						</div>

						<div className="panelContent">
							<table className="Table">
								<thead>
									<tr><th>Slug</th><th>Title</th><th>Published</th><th>Actions</th></tr>
								</thead>
								<ReactTransitionGroup component="tbody">
								{posts}
								</ReactTransitionGroup>
							</table>
						</div>

						{addPost}
					</section>
					<Toast visible={this.state.toastVisible} text={this.state.toastText} toastClass={this.state.toastClass} />
				</div>
			);
		},
		onCreatePostClick: function onCreatePostClick() {
			this.setState({addPostVisible: true});
		},
		onCreatePostSubmit: function onPostCreated(data) {
			tollan.postAction('blog/addPost', data)
				.then(response => {
					if (response.statusCode === 200) {
						//this.setState(this.getInitialState());
						postStore.load(); // Reload the entire tag store, easier than updating it
						this.setState({addPostVisible: false, toastVisible: true, toastClass: '', toastText: 'Post created successfully'});
					} else {
						this.setState({processing: false, errorText: 'Error: ' + response.statusCode + ' ' + response.body.errorText});
						//this.setState({addPostVisible: false, toastVisible: true, toastClass: '', toastText: 'Post created successfully'});
					}
				}).catch(err => {
					//this.setState({processing: false, errorText: 'Error (code: ' + err.message + ')'});
					this.setState({toastVisible: true, toastClass: 'error', toastText: 'Error creating post: ' + errText});
				});
			//this.setState({addPostVisible: false, toastVisible: true, toastClass: '', toastText: 'Post created successfully'});
		},
		onPostCreateCancel: function onPostCreateCancel() {
			this.setState({addPostVisible: false});
		},
		onPostDeleted: function() {
			this.setState({toastVisible: true, toastClass: '', toastText: 'Post deleted successfully'});
			postStore.load();
		},
		onPostDeleteFail: function(errText) {
			this.setState({toastVisible: true, toastClass: 'error', toastText: 'Error deleting post: ' + errText});
		},
		onPostSave: function() {
			this.setState({toastVisible: true, toastClass: '', toastText: 'Post saved successfully'});
			postStore.load();
		},
		onPostSaveFail: function(errText) {
			this.setState({toastVisible: true, toastClass: 'error', toastText: 'Error saving post: ' + errText});
		}
	});
//};
