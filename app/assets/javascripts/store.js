App.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.RESTAdapter.create({
    bulkCommit: false//,
//      find: function(store, type, id) {
//       console.log('calling find ' + id);
//       if (type === App.Compound) {
//	 thisType = type;
//	 thisID = id;
//	 thisStore = store;
//         var compoundSearcher = new Openphacts.CompoundSearch(ldaBaseUrl, appID, appKey);  
//         var compoundCallback=function(success, status, response){
//           var compound = compoundSearcher.parseCompoundResponse(response);
//           thisStore.load(thisType, thisID, compound);
//	   console.log('loading compound');
//         }; 
//         compoundSearcher.fetchCompound('http://www.conceptwiki.org/concept/' + id, compoundCallback);
//       }
//      }

  })
});

window.attr = DS.attr;
