//App.Store = DS.Store.extend({
//  revision: 12,
//  adapter: DS.RESTAdapter.create({
//    bulkCommit: false
//  })
//});

//window.attr = DS.attr;
App.CompoundAdapter = DS.Adapter.extend({
  find: function(store, type, id) {
    return new Ember.RSVP.Promise(function(resolve, reject){
      var searcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);  
	  var callback=function(success, status, response){  
        if (success) {
	        var compoundResult = searcher.parseCompoundResponse(response); 
            resolve(compoundResult);
        } else {
            reject(status);
        }
        //return compoundResult;
      }
	  searcher.fetchCompound('http://www.conceptwiki.org/concept/' + id, null, callback);
    });
  },
  extractSingle: function(store, type, payload, id, requestType) {
    var post = {}, commentIds = [];

    post.id = payload.id;
    post.title = payload.title;
    post._links = { user: payload._links.mapProperty('user').findProperty('href').href };

    // Leave the original un-normalized comments alone, but put them
    // in the right place in the payload. We'll normalize the comments
    // below in `normalizeHash`
    var comments = payload._embedded.comments.map(function(comment) {
      commentIds.push(comment.ID_);
      return { id: comment.ID_, body: comment.CMT_BODY };
    });

    post.comments = commentIds;

    var post_payload = { post: post, comments: comments };

    return this._super(store, type, post_payload, id, requestType);
  }
});
App.TargetAdapter = DS.Adapter.extend({
  find: function(store, type, id) {
    return $.getJSON("/" + this.pluralize(type) + "/" + id);
  }
});
App.EnzymeAdapter = DS.Adapter.extend({
  find: function(store, type, id) {
    return $.getJSON("/" + this.pluralize(type) + "/" + id);
  }
});
