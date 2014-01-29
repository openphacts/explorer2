# For reasons unknown this model causes apache/passenger to fail with 'missing method handle_asynchronously', no amount of
# debugging has found the cause. We have used this method in other apps with no problems. An explicit require is required to fix it
# See http://dev.mygrid.org.uk/blog/?p=201 for details

require 'delayed_job'
require 'cgi'
require 'csv'
require 'net/http'

class TsvFile < ActiveRecord::Base

  attr_accessible :uuid, :percentage, :status

  # Use with delayed job to process tsv downloads in the background
  def process params
    app_key = AppSettings.config["keys"]["app_key"]
    app_id = AppSettings.config["keys"]["app_id"]
    app_version = AppSettings.config["tsv"]["api_version"]
    url_path = ''
    domain = AppSettings.config["tsv"]["url"]
    path = AppSettings.config["tsv"][params[:request_type] + "_path"]
    url_params = "uri=" + CGI::escape(params[:uri]) + "&_format=tsv" + "&app_id=" + app_id + "&app_key=" + app_key
    params[:activity_type] != "" ? url_params += "&activity_type=" + CGI::escape(params[:activity_type]) : ''
    params[:activity_unit] != "" ? url_params += "&activity_unit=" + CGI::escape(params[:activity_unit]) : ''
    # activity_value can only be used if we have an activity_value_type
    if params[:activity_value_type] != "" && params[:activity_value] != "" 
      url_params += "&" + CGI::escape(params[:activity_value_type]) + "=" + CGI::escape(params[:activity_value])
    end
    params[:activity_relation] != "" ? url_params += "&activity_relation=" + CGI::escape(params[:activity_relation]) : ''
    # pchembl_value can only be used with pchembl_value_type
    if params[:pchembl_value_type] != "" && params[:pchembl_value] != ""
      url_params += "&" + CGI::escape(params[:pchembl_value_type]) + "=" + CGI::escape(params[:pchembl_value])
    end
    params[:assay_organism] != "" ? url_params += "&assay_organism=" + CGI::escape(params[:assay_organism]) : ''
    params[:target_organism] != "" ? url_params += "&target_organism=" + CGI::escape(params[:target_organism]) : ''
    number_of_pages = params[:total_count].to_i / 250
    number_of_pages += params[:total_count].to_i%250 > 0 ? 1 : 0 
    i = 1
    file = File.new(File.join(Rails.root, "filestore", self.uuid), "w")
    # download the tsv file 250 records at a time
    all_headers = []
    begin
      CSV.open(file.path, "w", {:col_sep=>"\t", :headers=>true}) do |tab|
        while i <= number_of_pages
          if app_version == ""
            url_path = "#{path}?".concat(url_params).concat("&_page=#{i}&_pageSize=250")
          else
            url_path = "/#{app_version}#{path}?".concat(url_params).concat("&_page=#{i}&_pageSize=250")
          end
          logger.info "Retrieving: " + url_path
          response = Net::HTTP.get(domain, url_path)
          tab_data = CSV.parse(response, {:col_sep => "\t", :headers => true})
          # only need the header line from the first response
          if i == 1 
            all_headers = tab_data.headers
            all_headers.delete(nil)
            tab << all_headers
          end
          tab_data.each do |row|
            current_row = []
            all_headers.each {|header| current_row << row.values_at(header)}
            tab << current_row
          end
          self.update_attributes(:percentage => 100/number_of_pages.to_f * i)
          i+=1
        end
      end
      self.update_attributes(:percentage => 100, :status => "finished")
    rescue Exception => e
      self.update_attributes(:status => "failed")
      logger.error "An error occurred retrieving response for #{url_path}: " + e.to_s
      # TODO send an error response?
    end
  end
  handle_asynchronously :process
  
  # Use with delayed job to process chemspider tsv downloads in the background
  def process_chemspider params
    # no guarantee you will get all the headers so here is a complete list, might change in the future so be aware
    app_key = AppSettings.config["keys"]["app_key"]
    app_id = AppSettings.config["keys"]["app_id"]
    app_version = AppSettings.config["tsv"]["api_version"]
    url_path = ''
    all_headers = []
    domain = AppSettings.config["tsv"]["url"]
    path = "/compound"
    file = File.new(File.join(Rails.root, "filestore", self.uuid), "w")
    first = true
    i = 1
    puts "uris are " + params[:uris].first
    total = params[:total]
    CSV.open(file.path, "w", {:col_sep=>"\t", :headers=>true}) do |tab|
      #tab << all_headers
      params[:uris].each do |uri|
        
        url_params = "uri=" + CGI::escape(uri) + "&_format=tsv&app_id=" + app_id + "&app_key=" + app_key
        begin
          if app_version == ""
            url_path = "#{path}?".concat(url_params)
          else
            url_path = "/#{app_version}#{path}?".concat(url_params)
          end
          response = Net::HTTP.get(domain, url_path)
          tab_data = CSV.parse(response, {:col_sep => "\t", :headers=>true})
          if i == 1 
            all_headers = tab_data.headers
            all_headers.delete(nil)
            tab << all_headers
          end
          tab_data.each do |row|
            current_row = []
            all_headers.each {|header| current_row << row.values_at(header)}
            tab << current_row
          end
          first = false
        rescue Exception => e
          logger.error "An error occurred retrieving response for #{url_path} : "  + e.to_s
        end
        pct = 100/total.to_f * i
        self.update_attributes(:percentage => pct)
        i += 1
      end  
    end
    self.update_attributes(:percentage => 100, :status => "finished")
  end
  handle_asynchronously :process_chemspider

end
