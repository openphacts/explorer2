import Ember from 'ember';
import config from './config/environment';

// If you want your urls to look www.yourapp.org/x instead of www.yourapp.org/#/x
// you have to set location to 'history'. This means that you must also tell rails
// what your routes are and to redirect them to whatever template contains the ember
// outlet
//
var Router = Ember.Router.extend({
	  location: config.locationType
});

App.Router.map(function() {
    this.route("search", {
        path: "/search"
    }, function() {

    });
    this.route('favourites', {
        path: '/favourites'
    }, function() {

    });
    this.resource('compounds', {
        path: '/compounds'
    }, function() {
        this.route('pharmacology', {
            path: '/pharmacology'
        }, function() {});
        this.route('pathways', {
            path: '/pathways'
        }, function() {});
        this.route('structure', {
            path: '/structure'
        }, function() {});
        this.route('draw', {
            path: '/draw'
        }, function() {});
    });
    this.resource('targets', {
        path: '/targets'
    }, function() {
        this.route('pharmacology', {
            path: '/pharmacology'
        }, function() {});
        this.route('pathways', {
            path: '/pathways'
        }, function() {});
        this.route('diseases', {
            path: '/diseases'
        }, function() {});
    });
    this.resource('trees', {
        path: '/trees'
    }, function() {
        this.route('pharmacology', {
            path: '/pharmacology'
        }, function() {});
    });
    this.resource('pathways', {
        path: '/pathways'
    }, function() {
        this.route('compounds', {
            path: '/compounds'
        }, function() {});
    });
    this.resource('diseases', {
        path: '/diseases'
    }, function() {
        this.route('targets', {
            path: '/targets'
        }, function() {});
    });
    this.route('catchall', {
        path: '/*wildcard'
    });
});

export default Router;
