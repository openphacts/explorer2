emq.globalize();
App.setupForTesting();
App.injectTestHelpers();
App.rootElement = '#ember-testing';
setResolver(Ember.DefaultResolver.create({
    namespace: App
}));

module('Integration: Transitions', {
  setup: function() {
    window.oldIE = false;
    window.typeaheadUrl = "http://localhost:3000/search/typeahead";
    window.ldaBaseUrl = "https://beta.openphacts.org/1.4";
    window.appID = "blah";
    window.appKey = "blah";
  },
  teardown: function() {
    App.reset();
  }
});

test('search for something', function() {
  expect(0);
  visit('/').then(function() {
  //notStrictEqual(find('.container'), null);
  //fillIn('#search_box', 'Aspirin');
  click('#search-button');

});
  //fillIn('#search_box', 'Aspirin');
  //click('#search-button');
  andThen(function() {
  });
});
