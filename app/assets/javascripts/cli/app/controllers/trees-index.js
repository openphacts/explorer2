App.TreesIndexController = Ember.ArrayController.extend({

    needs: ['application'],

    queryParams: ['ontology'],

    ontology: null,

    initialTree: null,
    defaultTree: null,
    selectedTree: null,
    treeTypes: ["enzyme", "chembl", "chebi", "go"],
    childTreeNodes: [],

    fetching: false,

    selectedTreeChanged: function() {
        var me = this;
        Ember.run(function() {
            if (me.get('selectedTree') !== null && me.get('selectedTree') !== me.get('initialTree')) {
                console.log('selected tree changed ' + me.get('selectedTree'));
                me.transitionToRoute('trees.index', {
                    queryParams: {
                        'ontology': me.get('selectedTree')
                    }
                });
            }
        });
    }.observes('selectedTree')

});
