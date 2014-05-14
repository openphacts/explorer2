module("Ember.js Library", {
    setup: function() {
        Ember.run(App, App.advanceReadiness);
    },
    teardown: function() {
        //App.reset();
    }
});

test("Check HTML is returned", function() {
    expect(1);
    visit("/").then(function() {
        ok(exists("*"), "HTML for application exists");
    });

});

test("Check free text search works", function() {
    expect(5);

    visit("/").then(function() {
        ok(exists(".navbar-search"), "The navbar was rendered");
        ok(exists("#search_box"), "Search box was found");
        ok(exists("#search-button"), "Search button was found");
    });

    visit("/").then(function() {
        fillIn("#search_box", "Aspirin");
    }).then(function() {
        Ember.run(function() {
            return click("#search-button");
        }).then(function() {
            console.log('After search');
            var firstResult = $('#search-results ul li:first-of-type h4 span')[0].textContent;
            equal(firstResult, "Aspirin", "Found first search result");
        }).then(function() {
            click($('#search-results ul li:first-of-type h4 a')[0]);
        }).then(function() {
            equal(currentRouteName(), "compounds.index", "Clicked on link for Aspirin and transitioned to route");
        });
    });
});
test("Check that compound info is rendered", function() {
    visit("/compounds?uri=http%3A%2F%2Fwww.conceptwiki.org%2Fconcept%2Fdd758846-1dac-4f0d-a329-06af9a7fa413").then(function() {
        equal(currentRouteName(), "compounds.index", "Clicked on link for Aspirin and transitioned to route");
    }).then(function() {
        click($('#provenance-on-button'));
    }).then(function() {
        ok(exists("#description-provenance ~ a img"), "Provenance icon shown for description");
        ok(exists("h1 a img"), "Provenance icon shown for pref label");
        ok(exists("#molform-provenance a img"), "Provenance icon shown for molform");
    });
});
