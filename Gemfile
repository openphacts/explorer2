source 'http://rubygems.org'

gem 'rails', '3.2.16'

gem 'rake', '10.1.1'

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
  gem 'bootstrap-sass', '3.1.0.2'
  # vendor ember doesn't understand that handlebars 1.0.0 is greater than 1.0.0.rc3, freeze it here for the moment
  gem 'handlebars_assets'
end

group :development do
  gem 'quiet_assets'
end

gem 'delayed_job_active_record'
gem 'daemons'
#needed for some linux deploys
gem 'therubyracer', '~>0.12.0', :platforms => :ruby
gem 'uuidtools'
