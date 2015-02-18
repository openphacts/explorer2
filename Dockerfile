FROM ubuntu:14.04
MAINTAINER "Stian Soiland-Reyes <orcid.org/0000-0001-9842-9718>"
WORKDIR /
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install ruby1.9.3 bundler libsqlite3-dev nodejs wget
COPY . /explorer2

ENV RAILS_ENV production
WORKDIR /explorer2
RUN bundle install 
RUN cp config/database.yml_example config/database.yml
RUN cp config/environments/production.rb_example config/environments/production.rb
RUN cp config/app_settings.yml_example config/app_settings.yml
RUN rake db:create:all
RUN rake db:migrate
RUN rake assets:precompile
RUN wget -o filestore/compounds.txt.bz2 http://data.openphacts.org/1.4/explorer2/compounds.txt.bz2
RUN wget -o filestore/compounds.txt.bz2.sha1 http://data.openphacts.org/1.4/explorer2/compounds.txt.bz2.sha1
RUN sha1sum -c filestore/compounds.txt.bz2.sha1 && \
  bunzip2 filestore/compounds.txt.bz2 && \
  rake explorer:load_all_assets && \
  rm filestore/compounds.txt

# URI for API (without trailing /)
ENV API_URL https://beta.openphacts.org/1.4
# Get your own key at https://dev.openphacts.org/admin/access_details
ENV API_APP_ID 161aeb7d
ENV API_APP_KEY cffc292726627ffc50ece1dccd15aeaf

EXPOSE 3000
ENTRYPOINT ["/explorer2/docker/entrypoint.sh"]
CMD ["rails", "server"]

