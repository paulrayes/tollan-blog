'use strict';

var slugify = require('http-slug');
if (process.env.TOLLAN_ENV !== 'browser') {
	require = require('parent-require');
}
module.exports = function(tollan) {
	//var React = tollan.React;
	//var Router = tollan.Router;
//var rrr = require('react/addons');
//console.log(rrr === React);
	var postStore = tollan.getStore('blog/postStore');
	var form = require('forrrm')(React);
	var TextInput = form.TextInput;
	var Toast = form.Toast;

	if (tollan.SERVER) {
		var PostForm = null;
	} else {
		var PostForm = require('./PostForm')(tollan);
	}

	var AddPost = require('./AddPost')(tollan);
	var PostRow = require('./PostRow')(tollan);
	//var PostForm = require('./PostForm');
	var ReactTransitionGroup = React.addons.TransitionGroup;

	return React.createClass({
		getInitialState: function getInitialState() {
			return {
				posts: [],
				addPostVisible: false,
				toastVisible: false,
				loaded: false
			}
		},
		componentDidMount: function componentDidMount() {
			postStore.on('change', this.onStoreChange);
			postStore.reload();
		},
		componentWillUnmount: function componentWillUnmount() {
			postStore.removeListener('change', this.onStoreChange);
		},
		onStoreChange: function() {
			this.setState({posts: postStore.getAll(), loaded: postStore.loaded});
		},
		render: function() {
			var posts = this.state.posts.map(post => {
				return <PostRow key={post.slug} post={post} onPostDeleted={this.onPostDeleted} onPostDeleteFail={this.onPostDeleteFail} onPostSave={this.onPostSave} onPostSaveFail={this.onPostSaveFail} />;
			});
			var addPost;
			if (this.state.addPostVisible) {
				addPost = <div className="ModalDialog">
					<div className="inner">
						<h2>Add a new post</h2>
						<PostForm onSubmit={this.onCreatePostSubmit} onCancel={this.onPostCreateCancel} />
					</div>
				</div>;
			}
			var panelContent;
			if (!postStore.loaded || !this.state.loaded) {
				panelContent = <tollan.loaderComponents.large />;
			} else if (!posts.length) {
				panelContent = <p>There are no posts.</p>;
			} else {
				panelContent = (
					<table className="Table">
						<thead>
							<tr><th>Slug</th><th>Title</th><th>Published</th><th>Actions</th></tr>
						</thead>
						<ReactTransitionGroup component="tbody">
						{posts}
						</ReactTransitionGroup>
					</table>
				);
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
							{panelContent}
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
						postStore.reload(); // Reload the entire tag store, easier than updating it
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
			postStore.reload();
		},
		onPostDeleteFail: function(errText) {
			this.setState({toastVisible: true, toastClass: 'error', toastText: 'Error deleting post: ' + errText});
		},
		onPostSave: function() {
			this.setState({toastVisible: true, toastClass: '', toastText: 'Post saved successfully'});
			postStore.reload();
		},
		onPostSaveFail: function(errText) {
			this.setState({toastVisible: true, toastClass: 'error', toastText: 'Error saving post: ' + errText});
		}
	});
};
