module("Ember.js Library", {
    setup: function() {
        Ember.run(App, App.advanceReadiness);
    },
    teardown: function() {
        App.reset();
    }
});

test("Check HTML is returned", function() {

    visit("/").then(function() {
        ok(exists("*"), "Found HTML!");
    });

});

test("Check free text search works", function() {
    expect(6);

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
	});
    })
});
