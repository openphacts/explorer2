FROM ubuntu:14.04
WORKDIR /
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install ruby1.9.3 bundler libsqlite3-dev nodejs
COPY . /explorer2

ENV RAILS_ENV production
WORKDIR /explorer2
RUN bundle install 
RUN cp config/database.yml_example config/database.yml
RUN cp config/environments/production.rb_example config/environments/production.rb
RUN cp config/app_settings.yml_example config/app_settings.yml
RUN sed -i 's/url *:.*/url: ENV["API_URL"]/' config/app_settings.yml
RUN sed -i 's/app_id *:.*/app_id: ENV["API_APP_ID"]/' config/app_settings.yml
RUN sed -i 's/app_key *:.*/app_key : ENV["API_APP_KEY"]/' config/app_settings.yml
RUN cat config/app_settings.yml
RUN rake db:create:all
RUN rake db:migrate
RUN rake assets:precompile
#RUN rake explorer:load_all_assets

# Get your own key at https://dev.openphacts.org/admin/access_details
ENV API_URL https://beta.openphacts.org/1.4/
ENV API_APP_ID 161aeb7d
ENV API_APP_KEY cffc292726627ffc50ece1dccd15aeaf

EXPOSE 3000
ENTRYPOINT ["/explorer2/docker/entrypoint.sh"]
CMD ["rails", "server"]

