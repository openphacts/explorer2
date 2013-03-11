App.SearchBox = Em.TextField.extend({

    insertNewline: function() {
      var query = this.get('value');
      // remove all current results before searching
      App.compoundsController.set('content', []);
      App.searchResultsController.setCurrentQuery(query);
      App.searchResultsController.search(query);
    }

  });
