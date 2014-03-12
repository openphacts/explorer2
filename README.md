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
* Start a rails console (rails c)
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
The Explorer uses an embedded version of the [Ketcher](http://ggasoftware.com/opensource/ketcher "Ketcher tool for drawing chemical compounds") compound drawing tool by [GGA Software Services](http://ggasoftware.com "GGA Software Services"). If you require users to be able to draw compounds that they have found using the Explorer then you will need to install the Indigo C libraries on your machine. To avoid any firewall issues the rails side of the application proxies across to the ketcher app and a setting has to be added to app_settings.yml.

* git clone https://github.com/ggasoftware/indigo.git
* Build the C libraries
* python build_scripts/indigo-release-libs.py --preset=linux64 (There are presets for linux32, linux64, win32, win64, mac10.5, mac10.6 (for 10.7 also))
* Extract the Python Indigo wrappers
* python api/make-python-wrappers.py
* Copy the headers available in indigo/api/libs/shared/Linux/x64/ to explorer2/public/ketcher/lib/Linux/x64
Note: change the directory to the appropriate one for your system)
* Copy api/python/indigo.py to explorer2/public/ketcher/
* Start with python ketcher-server.py
* The rails side needs to know what port to call the ketcher app on, add the 'port' parameter to the ketcher settings in app_settings.yml

Licence
=======
The Explorer '2' source code is released under the [MIT License](http://opensource.org/licenses/MIT "MIT License for software"). See licence.txt for more details.
