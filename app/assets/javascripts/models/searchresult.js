App.SearchResult = DS.Model.extend({
    id: null,

    isCompound: function(className) {
      return this instanceof className;
    }
})
