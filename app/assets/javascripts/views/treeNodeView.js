App.TreeNodeView = Ember.View.extend({
  opened: false,
  highlighted: false,
  branch: function(){
    return this.get('content').get('hasChildren');
  }.property('content.hasChildren'),
  subBranch: undefined,
  fetchedData: false,
  indentLevel: function(){
	return 'indentLevel' + this.get('content').get('level');
  }.property('content.level'),
  tagName: 'div',
  // class names that determine what icons are used beside the node
  classNameBindings: ['opened: tree-branch-open:tree-branch-closed', 'branch:tree-branch-icon:tree-node-icon', 'indentLevel', 'highlighted: highlight-on'],
  classNames: ['treerow'],
  templateName: 'treenode',
  // Ember had some issues with finding the treenode template when the branch view is dynamically added to
  // the parent collection view in the click event. Had to compile the template here instead
  //template: Ember.Handlebars.compile('<img src="/assets/table.png" class="single-enzyme-icon"><img src="/assets/folder_go.png" class="folder-open" {{action expand target="view"}}></img><img src="/assets/folder.png" class="folder-closed" {{action expand target="view"}}></img><div class="enzymeURI">{{enzymeECNumber view.content.uri}}</div>{{enzymePharmaLink view.content.uri view.content.name}}'),

  mouseEnter: function(evt) {
		var name, uri;
		var me = this;
		name = this.get('content').name ? this.get('content').name : this.get('content').get('name');
		uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
	    console.log("Mouse Enter " + name + " " + uri);
	    this.set('highlighted', true);
  },
  mouseLeave: function(evt) {
		var name, uri;
		var me = this;
		name = this.get('content').name ? this.get('content').name : this.get('content').get('name');
		uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
	    console.log("Mouse leave " + name + " " + uri);
	    this.set('highlighted', false);
  },
actions: {
  expand: function() {
        console.log('expand');
        var controller = this.get('controller');
        var me = this;
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
			var me = this;
            var parent = this.get('content');
			name = this.get('content').name ? this.get('content').name : this.get('content').get('name');
			uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
		    console.log("Clicked on " + name + " " + uri);
		    if (this.get('content').get('hasChildren')) {
			    // only fetch for uris which have children
                //var treeBranchView = App.TreeBranchView.create();
			    //var treeBranchView = me.get('parentView').createChildView(App.TreeBranchView);
                //controller.get('childTreeNodes').push(treeBranchView);
				//var index = me.get('parentView').indexOf(me) + 1;
                //me.get('parentView').pushObject(treeBranchView);
                //me.get('parentView').insertAt(index, treeBranchView);
			    //treeBranchView.set('content', []);
                var contentIndex = controller.get('content').indexOf(this.get('content'));
			    var searcher = new Openphacts.TreeSearch(ldaBaseUrl, appID, appKey);
		        var callback = function(success, status, response) {
			        if (success && response) {
				        var members = searcher.parseChildNodes(response);
				        var membersWithSingleName = [];
				        $.each(members.children, function(index, member) {
							var enzyme = me.get('controller').store.createRecord('tree');
						    enzyme.set('uri', member.uri);
							enzyme.set('name', member.names[0]);
							enzyme.set('id', member.uri.split('/').pop());
                            enzyme.set('hasChildren', false);
                            enzyme.set('level', parent.get('level') + 1);
                            controller.get('content').insertAt(contentIndex + 1, enzyme);
                            parent.get('children').pushObject(enzyme);
		                    //treeBranchView.get('content').pushObject(enzyme);
                            // now figure out if this node has children
		                    var innerCallback = function(success, status, response) {
			                  if (success && response) {
			                    var members = searcher.parseChildNodes(response);
                                //does the node have children
                                enzyme.set('hasChildren', members.children.length > 0 ? true : false);
				              } else {
                                enzyme.set('hasChildren', false);
                              }
			                }
                            searcher.getChildNodes(member.uri, innerCallback);
				        });
					    //var index = me.get('parentView').indexOf(me) + 1;
                        //me.get('parentView').get('childViews').pushObject(treeBranchView)
					    //me.get('parentView').insertAt(index, treeBranchView);
					    me.set('opened', true);
					    //me.set('subBranch', treeBranchView);
					    me.set('fetchedData', true);
				    }
			    }
			    searcher.getChildNodes(uri, callback);
		    }
		}
  }
}
});
