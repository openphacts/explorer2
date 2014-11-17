source 'http://rubygems.org'

gem 'rails', '3.2.19'

gem 'rake', '10.1.1'

#change to your db of choice here
gem 'sqlite3'

group :assets do
  gem 'sass-rails', '~> 3.2'
  gem 'coffee-rails', '~> 3.2'
  gem 'compass-rails'
  gem 'uglifier'
  # ensure bootstrap 2, not 3
  gem 'bootstrap-sass', '2.3.2.2'
  # vendor ember doesn't understand that handlebars 1.0.0 is greater than 1.0.0.rc3, freeze it here for the moment
  gem 'handlebars_assets'
end

group :development, :test do
  gem 'quiet_assets'
  gem 'qunit-rails'
end
# sass 3.4.2 causes No such file or directory error due to some clash with bootstrap-sass 2.x
gem 'sass', '3.4.1'
gem 'delayed_job_active_record'
gem 'daemons'
#needed for some linux deploys
#gem 'therubyracer', '~>0.12.0', :platforms => :ruby
#bundler/therubyracer causes libv8 build issues on osx mavericks so try execjs instead 
gem 'execjs'
gem 'uuidtools'
gem 'font-awesome-rails', '4.2.0.0'
