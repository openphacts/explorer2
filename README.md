Introduction
============

The Open PHACTS Explorer is an HTML5 & CSS3 application for chemical information discovery and browsing. It is used to search for chemical compound and target information using a web  search interface. It uses [Ruby on Rails](http://www.rubyonrails.org "Ruby on Rails Web Application framework"), [Ember JS](http://emberjs.com "Ember JS Javascript MVC framework") and [OPS.JS](http://github.com/openphacts/ops.js "OPS.JS Javascript library for accessing the Open PHACTS Linked Data API"). The Explorer uses the [Open PHACTS Linked Data API](http://dev.openphacts.org "Open PHACTS Linked Data API developer documentation and registration").

Technology
==========

[Ruby 1.9.3+](http://ruby-lang.org "Ruby dynamic, open source programming language"), Ruby on Rails 3.2.x, Ember JS, [Bootstrap CSS/JS](http://getbootstrap.com/2.3.2/, "Bootstrap CSS and Javascript widgets")

Setup
=====

* `ruby -v` to check your Ruby version and install if required. 
  * You may want to use [https://rvm.io/](rvm) to handle multiple versions of ruby
* `bundle install` 
* Copy `config/database.yml_example` to `config/database.yml` and uncomment/configure your database of choice
* Copy `config/environments/development.rb_example` to `config/environments/development.rb`
  * (and production/test)
* [Register](http://dev.openphacts.org "Open PHACTS developer home") to get your application keys.
* Copy `config/app_settings.yml_example` to `config/app_settings.yml` 
  * change the `url`, `app_id` and `app_key` app keys and API url to the appropriate values. 
  * Add settings for [ketcher](#ketcher) (see below).
* `rake db:create:all`
* `rake db:migrate`
* `rake assets:precompile`
* `rails s`

Now navigate your browser to http://localhost:3000/

Autocompleter
-------------
There are now too many compounds to do the autocomplete by reading a text file from disk and searching it line by line so you need to load the compounds into the database using the following steps.  

<<<<<<< HEAD
* `wget -o filestore/compounds.txt.bz2 http://data.openphacts.org/1.4/explorer2/compounds.txt.bz2`
* `bunzip2` filestore/compounds.txt.bz2
=======
* Get the file compounds.txt.bz2 from http://data.openphacts.org/1.4/explorer2/ and put in filestore directory
* Unzip the compounds file
>>>>>>> f077baa04aa8823f18785772fce1d6a6d7197cad
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
The Ember JS side of things uses the [Qunit](http://qunitjs.com/ "Qunit JavaScript test framework") test framework with [Karma](https://github.com/karma-runner/karma "Karma test runner") for automation. The javascript test files are within `app/assets/javascripts/tests`. We recommend looking at the [Ember testing guides](http://emberjs.com/guides/testing/ "Ember testing guides") but here is some setup info. The Karma test runner setup files are contained in `test/karma`. The js to load and browsers to test are defined in `karma.conf.js`. To install Karma you will need [Node JS](http://nodejs.org/ "Node JS") (stop, come back, it's not that hard). Then you need to run `npm install` which installs the dependencies listed in the `package.json` file. These dependencies will be installed local to the karma directory so you will probably need to set up a path to find them `export PATH="./node_modules/.bin:$PATH"`. You will also need Karma's command line interface `npm install -g karma-cli`. Then to run the tests do `karma start`.

Ketcher
-------
The Explorer uses an embedded version of the [Ketcher](http://ggasoftware.com/opensource/ketcher "Ketcher tool for drawing chemical compounds") compound drawing tool by [GGA Software Services](http://ggasoftware.com "GGA Software Services"). 

Licence
=======
The Explorer '2' source code is released under the [MIT License](http://opensource.org/licenses/MIT "MIT License for software"). See licence.txt for more details.
