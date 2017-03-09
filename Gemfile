source 'http://rubygems.org'

gem 'rails', '3.2.22'

#gem 'rake', '10.1.1'

#change to your db of choice here
gem 'sqlite3'

group :assets do
  gem 'sass-rails', '~> 3.2'
  gem 'coffee-rails', '~> 3.2'
  #gem 'compass-rails'
  gem 'uglifier'
  gem 'bootstrap-sass', '~> 3.2.0.1'
  gem 'handlebars_assets', '0.20.2'
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
gem 'font-awesome-rails'
gem "activerecord-import", ">= 0.2.0"

