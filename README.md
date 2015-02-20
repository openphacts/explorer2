#Open PHACTS Explorer 2 [![DOI](https://zenodo.org/badge/doi/10.5281/zenodo.15551.svg)](http://dx.doi.org/10.5281/zenodo.15551)

Introduction
============

The Open PHACTS Explorer is an HTML5 & CSS3 application for chemical information discovery and browsing. It is used to search for chemical compound and target information using a web  search interface. It uses [Ruby on Rails](http://www.rubyonrails.org "Ruby on Rails Web Application framework"), [Ember JS](http://emberjs.com "Ember JS Javascript MVC framework") and [OPS.JS](http://github.com/openphacts/ops.js "OPS.JS Javascript library for accessing the Open PHACTS Linked Data API"). The Explorer uses the [Open PHACTS Linked Data API](http://dev.openphacts.org "Open PHACTS Linked Data API developer documentation and registration").

Docker image
============

The experimental [Docker](https://www.docker.com/) image [openphacts/explorer2](https://registry.hub.docker.com/u/openphacts/explorer2/)
can be used to run the explorer2 on any Linux host with Docker:

    docker pull openphacts/explorer2
    docker run -p 3000:3000 -e RAILS_ENV=development -it openphacts/explorer2 

This will start Explorer2 on [http://localhost:3000/](http://localhost:3000/)

FIXME: The autocomplete data for the search is not loaded.

The environment variables that can be set, together with their defaults:

```
-e RAILS_ENV=production
-e API_URL=https://beta.openphacts.org/1.4
-e API_APP_ID=161aeb7d
-e API_APP_KEY=cffc292726627ffc50ece1dccd15aeaf
```

Technology
==========

[Ruby 1.9.3+](http://ruby-lang.org "Ruby dynamic, open source programming language"), Ruby on Rails 3.2.x, Ember JS, [Bootstrap CSS/JS](http://getbootstrap.com/2.3.2/, "Bootstrap CSS and Javascript widgets")

Setup
=====

* `ruby -v` to check your Ruby version and install if required. 
  * You may want to use [rvm](https://rvm.io/) to handle multiple versions of ruby
* `bundle install` 
* Copy `config/database.yml_example` to `config/database.yml` and uncomment/configure your database of choice
* Copy `config/environments/development.rb_example` to `config/environments/development.rb`
  * (and production/test)
* [Register](http://dev.openphacts.org "Open PHACTS developer home") to get your application keys.
* Copy `config/app_settings.yml_example` to `config/app_settings.yml` 
  * change the `url`, `app_id` and `app_key` app keys and API url to the appropriate values. 
* `rake db:create:all`
* `rake db:migrate`
  * add `RAILS_ENV="production"` or `RAILS_ENV="test"` to migrate those environments, by default it wil be `development`
* `rake assets:precompile` if running in `production` environment
  * If running webrick in production then change `config.serve_static_assets = false` to `config.serve_static_assets = true` in `config/environments/production.rb`
* `rails s`

Now navigate your browser to [http://localhost:3000/](http://localhost:3000/)

Autocompleter
-------------
There are now too many compounds to do the autocomplete by reading a text file from disk and searching it line by line so you need to load the compounds into the database using the following steps.  

* `wget -o filestore/compounds.txt.bz2 http://data.openphacts.org/1.4/explorer2/compounds.txt.bz2`
* `bunzip2 filestore/compounds.txt.bz2`
* Run `rake explorer:load_all_assets`. To load in to production db prepend with `RAILS_ENV=production`
  * Or start a rails console (rails c) and enter the following commands to add compound models to the database  

    file = File.new(File.join(Rails.root, "filestore", "compounds.txt"), "r")  
    file.each_line do |line|  
    c = Compound.new  
    c.label = line.chomp  
    c.save  
    end

  It will probably take the console a few hours to get through them all (there are now over 1 million!). 

  Do the same for `targets.txt` and `organisms.txt` which are already in `filestore/`.

Testing
-------
The Ember JS side of things uses the [Qunit](http://qunitjs.com/ "Qunit JavaScript test framework") test framework with [Karma](https://github.com/karma-runner/karma "Karma test runner") for automation. The javascript test files are within `app/assets/javascripts/tests`. We recommend looking at the [Ember testing guides](http://emberjs.com/guides/testing/ "Ember testing guides") but here is some setup info. The Karma test runner setup files are contained in the directory `test/karma`. The js to load and browsers to test are defined in `karma.conf.js`. To install Karma you will need [Node JS](http://nodejs.org/ "Node JS") (stop, come back, it's not that hard). Then you need to run `npm install` which installs the dependencies listed in the `package.json` file. These dependencies will be installed local to the karma directory so you will probably need to set up a path to find them `export PATH="./node_modules/.bin:$PATH"`. You will also need Karma's command line interface `npm install -g karma-cli`. Then to run the tests do `karma start`.

Ketcher
-------
The Explorer uses an embedded version of the [Ketcher](http://ggasoftware.com/opensource/ketcher "Ketcher tool for drawing chemical compounds") compound drawing tool by [GGA Software Services](http://ggasoftware.com "GGA Software Services"). 

Licence
=======
The Explorer '2' source code is released under the [MIT License](http://opensource.org/licenses/MIT "MIT License for software"). See licence.txt for more details.
