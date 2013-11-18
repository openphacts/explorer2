source 'http://rubygems.org'

gem 'rails', '3.2.12'

group :development, :test do
  gem 'sqlite3'
end

group :production do
  gem 'pg'
end

group :assets do
  gem 'sass-rails', '~> 3.2'
  gem 'coffee-rails', '~> 3.2'
  gem 'compass-rails'
  gem 'uglifier'
  gem 'bootstrap-sass', '2.3.2.2'
  # vendor ember doesn't understand that handlebars 1.0.0 is greater than 1.0.0.rc3, freeze it here for the moment
  gem 'handlebars_assets'
  gem 'delayed_job_active_record'
  gem 'daemons'
  #needed for some linux deploys
  gem 'therubyracer', '~>0.10.0', :platforms => :ruby
  gem 'uuidtools'
end

group :development do
  gem 'quiet_assets'
end
