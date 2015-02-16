require 'cgi'
require 'csv'
require 'net/http'

class TsvFile < ActiveRecord::Base

  attr_accessible :uuid, :percentage, :status

  # Use with delayed job to process tsv downloads in the background
  def process params
    app_key = AppSettings.config["keys"]["app_key"]
    app_id = AppSettings.config["keys"]["app_id"]
    domain = AppSettings.config["api"]["url"]
    path = AppSettings.config["tsv"][params[:request_type] + "_path"]
    url_path = ''
    url_params = domain + path + "?uri=" + CGI::escape(params[:uri]) + "&_format=tsv" + "&app_id=" + app_id + "&app_key=" + app_key
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
    file = File.new(File.join(Rails.root, "filestore", "tsv", self.uuid), "w")
    # download the tsv file 250 records at a time
    all_headers = []
    begin
      CSV.open(file.path, "w", {:col_sep=>"\t", :headers=>true}) do |tab|
        while i <= number_of_pages
          url_path = url_params + "&_page=#{i}&_pageSize=250"
          logger.info "Retrieving: " + url_path.to_s
          uri = URI.parse(url_path)
          http = Net::HTTP.new(uri.host,uri.port)
          #5 minute timeout
          http.read_timeout = 300
          if uri.scheme == "https" 
            http.use_ssl = true
            #by default Ruby 1.9 uses VERIFY_PEER
            #as long as it can find the ca certs all will be good but.....
            http.verify_mode = OpenSSL::SSL::VERIFY_NONE
          end
          response = http.get(uri.request_uri)
          # CSV has problems parsing escaped double quotes like \", set the quote character to be the ascii bell one since it really should not show up in a tsv file
          tab_data = CSV.parse(response.body, {:col_sep => "\t", :headers => true, :quote_char => "\a"})
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
    app_key = AppSettings.config["keys"]["app_key"]
    app_id = AppSettings.config["keys"]["app_id"]
    url_path = ''
    all_headers = []
    domain = AppSettings.config["api"]["url"]
    path = "/compound"
    file = File.new(File.join(Rails.root, "filestore", "tsv", self.uuid), "w")
    first = true
    i = 1
    total = params[:total]
    CSV.open(file.path, "w", {:col_sep=>"\t", :headers=>true}) do |tab|
      #tab << all_headers
      params[:uris].each do |uri|
        url_params = domain + path + "?uri=" + CGI::escape(uri) + "&_format=tsv&app_id=" + app_id + "&app_key=" + app_key
        begin
          logger.info "Retrieving: " + url_params.to_s
          uri = URI.parse(url_params)
          http = Net::HTTP.new(uri.host, uri.port)
          #5 minute timeout
          http.read_timeout = 300
          if uri.scheme == "https" 
            http.use_ssl = true
            #by default Ruby 1.9 uses VERIFY_PEER
            #as long as it can find the ca certs all will be good but.....
            http.verify_mode = OpenSSL::SSL::VERIFY_NONE
          end
          response = http.get(uri.request_uri)
          # CSV has problems parsing escaped double quotes like \", set the quote character to be the ascii bell one since it really should not show up in a tsv file
          tab_data = CSV.parse(response.body, {:col_sep => "\t", :headers=>true, :quote_char => "\a"})
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
