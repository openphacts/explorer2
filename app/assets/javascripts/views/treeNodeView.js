App.TreeNodeView = Ember.View.extend({
    opened: false,
    //keep track of which uri has children
    hasChildrenList: {},
    fetchingData: false,
    highlighted: false,

    hidden: function() {
        return this.get('content').get('hidden');
    }.property('content.hidden'),

    branch: function() {
        return this.get('content').get('hasChildren');
    }.property('content.hasChildren'),

    node: function() {
        return (this.get('content').get('hasChildren') === false);
    }.property('content.hasChildren'),

    opened: function() {
        return (this.get('content').get('opened') === true);
    }.property('content.opened'),

    closed: function() {
        return (this.get('content').get('opened') === false);
    }.property('content.closed'),

    subBranch: undefined,
    fetchedData: false,
    indentLevel: function() {
        return 'indentLevel' + this.get('content').get('level');
    }.property('content.level'),
    tagName: 'div',
    // class names that determine what icons are used beside the node
    classNameBindings: [':medium-padding-bottom', 'hidden', 'indentLevel', 'highlighted:highlight-on'],
    classNames: ['treerow'],
    templateName: 'treenode',
    // Ember had some issues with finding the treenode template when the branch view is dynamically added to
    // the parent collection view in the click event. Had to compile the template here instead

    actions: {
        expand: function() {
            var controller = this.get('controller');
            var contentIndex = controller.get('content').indexOf(this.get('content'));
            var parent = controller.get('content')[contentIndex];
            var me = this;
            this.set('fetchingData', true);
            // the initial treebranch is loaded with data from the controller, sub branches are given data directly
            // hence the need to get the data slightly differently. Sure it's a fudge but.....
            if (parent.get('opened')) {
                // user wants to close the branch
                var index = this.get('parentView').indexOf(this) + 1;
                me.iterateOverChildren(this.get('content'), true);
                this.set('opened', false);
                this.get('content').set('opened', false);
                this.set('fetchingData', false);
            } else if (parent.get('fetchedData')) {
                // user wants to open the branch and we have already created the view before
                var index = this.get('parentView').indexOf(this) + 1;
                me.iterateOverChildren(this.get('content'), false);
                this.set('fetchingData', false);
                this.set('opened', true);
                this.get('content').set('opened', true);
            } else {
                // user wants to open the branch for the first time
                var name, uri;
                var me = this;
                var parent = this.get('content');
                name = this.get('content').name ? this.get('content').name : this.get('content').get('name');
                uri = this.get('content').uri ? this.get('content').uri : this.get('content').get('uri');
                if (this.get('content').get('hasChildren')) {
                    var contentIndex = controller.get('content').indexOf(this.get('content'));
                    var searcher = new TreeSearch(ldaBaseUrl, appID, appKey);
                    var callback = function(success, status, response) {
                        if (success && response) {
                            me.set('fetchingData', false);
                            me.set('opened', true);
                            me.get('content').set('opened', true);
                            var members = searcher.parseChildNodes(response);
                            var membersWithSingleName = [];
                            var allMembers = [];
                            //firstly find all the children
                            $.each(members.children, function(index, member) {
                                var enzyme = me.get('controller').store.createRecord('tree');
                                if (member.uri != null && member.names[0] != null) {
                                    enzyme.set('uri', member.uri);
                                    enzyme.set('name', member.names[0]);
                                    enzyme.set('id', member.uri.split('/').pop());
                                    // assume that all the children have children until clicked unless we have already loaded this one
                                    if (me.get('hasChildrenList')[member.uri] != null && me.get('hasChildrenList')[member.uri] === true) {
                                        enzyme.set('hasChildren', true);
                                    } else if (me.get('hasChildrenList')[member.uri] != null && me.get('hasChildrenList')[member.uri] === false) {
                                        enzyme.set('hasChildren', false);
                                    } else {
                                        enzyme.set('hasChildren', true);
                                    }
                                    enzyme.set('level', parent.get('level') + 1);
                                    allMembers.push(enzyme);
                                }
                            });
                            //then sort them
                            allMembers.sort(function(a, b) {
                                var x = a.get('uri').split('/').pop();
                                var y = b.get('uri').split('/').pop();
                                if (x === y) {
                                    return 0;
                                }
                                return y < x ? -1 : 1;
                            });
                            $.each(allMembers, function(index, member) {
                                controller.get('content').insertAt(contentIndex + 1, member);
                                controller.get('content')[contentIndex].get('children').pushObject(member);
                            });
                        } else {
                            // api sent false (or it broke!)    
                            me.set('fetchingData', false);
                            me.get('content').set('hasChildren', false);
                            me.get('hasChildrenList')[uri] = false;
                        }
                    }
                    searcher.getChildNodes(uri, callback);
                }
            }
        }
    },
    iterateOverChildren: function(child, hidden) {
        var me = this;
        $.each(child.get('children').get('content'), function(index, innerChild) {
            if (innerChild.get('parent').get('opened') == hidden) {
                innerChild.set('hidden', hidden);
                me.iterateOverChildren(innerChild, hidden);
            }
        });
        child.set('opened', hidden);
    }

});
