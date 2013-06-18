App.TreeNodeView = Ember.View.extend({
  opened: false,
  subBranch: undefined,
  fetchedData: false,
  tagName: 'li',
  //templateName: 'treenode',
  // Ember had some issues with finding the treenode template when the branch view is dynamically added to
  // the parent collection view in the click event. Had to compile the template here instead
  template: Ember.Handlebars.compile('{{view.content.name}}{{view.content.uri}}'),
  classNames: ['treenode'],
  click: function(evt) {
	// the initial treebranch is loaded with data from the controller, sub branches are given data directly
	// hence the need to get the data slightly differently. Sure it's a fudge but.....
	if (this.get('opened')) {
		// user wants to close the branch
		var index = this.get('parentView').indexOf(this) + 1;
		this.get('parentView').removeAt(index);
		this.set('opened', false);
	} else if (this.get('fetchedData')){
		// user wants to open the branch and we have already created the view before
		var index = this.get('parentView').indexOf(this) + 1;
		this.get('parentView').insertAt(index, this.get('subBranch'));
		this.set('opened', true);
	} else {
		// user wants to open the branch for the first time
		var name, uri;
		name = this.get('content').name ? this.get('content').name : this.get('content').get('name');
		uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
	    console.log("Clicked on " + name + " " + uri);
	    var index = this.get('parentView').indexOf(this) + 1;
	    var treeBranchView = App.TreeBranchView.create();
	    treeBranchView.set('content', [{'name': 'a', 'uri': 'sdgdfg'}, {'name': 'b', 'uri': 'ertwe'}]);
	    //this.get('parentView').insertAt(index, App.TreeBranchView.create(content: [{'name': 'a', 'uri': 'sdgdfg'}, {'name': 'b', 'uri': 'ertwe'}]));
	    this.get('parentView').insertAt(index, treeBranchView);
	    this.set('opened', true);
	    this.set('subBranch', treeBranchView);
	    this.set('fetchedData', true);	
	}
  }
});