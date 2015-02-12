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
    expect(1);
    visit('/').then(function() {
        fillIn('#search_box', 'Aspirin');
    }).then(function() {
        click('#search-button');
    }).then(function() {
        // just test the transition to search after button click, the actual results will not have loaded yet
        equal(currentRouteName(), 'search.index');
        //notStrictEqual(find('#search-results > ul > li:first').length, 0);;
    });
});
test('Browse by ontology link works', function() {
    visit('/').then(function() {
        click('#target-class > a')
    }).then(function() {
        equal(currentRouteName(), 'trees.index');
    });
});
test('Structure search link works', function() {
    visit('/').then(function() {
        click('#structure-search-link > a')
    }).then(function() {
        equal(currentRouteName(), 'compounds.structure.index');
    });
});
test('Draw structure link works', function() {
    visit('/').then(function() {
        click('#structure-draw-link > a')
    }).then(function() {
        equal(currentRouteName(), 'compounds.draw.index');
    });
});
test('Favourites link works', function() {
    visit('/').then(function() {
        click('#favourites-link > a')
    }).then(function() {
        equal(currentRouteName(), 'favourites.index');
    });
});
