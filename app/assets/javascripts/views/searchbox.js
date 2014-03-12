App.SearchBox = Em.TextField.extend({
	
    didInsertElement: function() {
      return this.$().typeahead({
        source: function (query, process) {
            $.getJSON(typeaheadUrl, { query: query }, function (data) {
                return process(data);
            })
        }
      });
    },
    classNames:["search-query"],

    insertNewline: function() {
      var query = this.get('value');
      this.get("controller").send("submitInController", 1); //you do not have to send object, if you do not need to

      // remove all current results before searching
      //App.compoundsController.set('content', []);
      //App.searchController.setCurrentQuery(query);
      // it is a new query so reset all the pagination and result details
      //App.searchController.resetPageCount(query);
    }

  });
