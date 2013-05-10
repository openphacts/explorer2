App.SearchBox = Em.TextField.extend({
   typeaheadPath: '/search/typeahead',
    didInsertElement: function() {
      return this.$().typeahead({
        source: function (query, process) {
            $.json(typeaheadPath, { query: query }, function (data) {
                return process(data);
            })
        },
        typeaheadPath: this.typeaheadPath
      });
    },
    
    classNames:["search-query"],

    insertNewline: function() {
      var query = this.get('value');
      // remove all current results before searching
      App.compoundsController.set('content', []);
      App.searchController.setCurrentQuery(query);
      // it is a new query so reset all the pagination and result details
      App.searchController.resetPageCount(query);
    }

  });
