Introduction
============

The Open PHACTS Explorer is an HTML5 & CSS3 application for chemical information discovery and browsing. It is used to search for chemical compound and target information using a web  search interface. It uses [Ruby on Rails](http://www.rubyonrails.org "Ruby on Rails Web Application framework"), [Ember JS](http://emberjs.com "Ember JS Javascript MVC framework") and [OPS.JS](http://github.com/openphacts/ops.js "OPS.JS Javascript library for accessing the Open PHACTS Linked Data API"). The Explorer uses the [Open PHACTS Linked Data API](http://dev.openphacts.org "Open PHACTS Linked Data API developer documentation and registration").

Technology
==========

[Ruby 1.9.3+](http://ruby-lang.org "Ruby dynamic, open source programming language"), Ruby on Rails 3.2.x, Ember JS, [Bootstrap CSS/JS](http://getbootstrap.com/2.3.2/, "Bootstrap CSS and Javascript widgets")

Setup
=====

* Run ruby -v to check your Ruby version and install if required.
* Run bundle install to grab any required gems.
* Copy config/database.yml_example to config/database.yml and uncomment/configure your database of choice
* Copy config/environments/development.rb_example to config/environments/development.rb (and production/test)
* Run rake db:create:all
* Run rake db:migrate
* [Register](http://dev.openphacts.org "Open PHACTS developer home") to get your application keys.
* Copy config/app_settings.yml_example to config/app_settings.yml and change the app keys and API url to the appropriate values. Add settings for ketcher (see below).

Run rails s to start the server and navigate your browser to localhost:3000

Autocompleter
-------------
There are now too many compounds to do the autocomplete by reading a text file from disk and searching it line by line so you need to load the compounds into the database using the following steps.  

* Gunzip filestore/compounds.tar.gz
* Either run the rake task rake explorer:load_all_assets. To load in to production db prepend with RAILS_ENV=production
* Or start a rails console (rails c)
* Enter the following commands to add compound models to the database  

    file = File.new(File.join(Rails.root, "filestore", "compounds.txt"), "r")  
    file.each_line do |line|  
    c = Compound.new  
    c.label = line.chomp  
    c.save  
    end


It will probably take the console a few hours to get through them all (there are now over 1 million!). Do the same for Target & Organism.

Ketcher
-------
The Explorer uses an embedded version of the [Ketcher](http://ggasoftware.com/opensource/ketcher "Ketcher tool for drawing chemical compounds") compound drawing tool by [GGA Software Services](http://ggasoftware.com "GGA Software Services"). 

Licence
=======
The Explorer '2' source code is released under the [MIT License](http://opensource.org/licenses/MIT "MIT License for software"). See licence.txt for more details.
