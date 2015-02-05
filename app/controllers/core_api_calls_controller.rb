require 'uuidtools'
require 'tempfile'

class CoreApiCallsController < ApplicationController

  # Get the list of lenses from the IMS
#  def lenses
#    #uri = URI.parse(AppSettings.config["ims"]["lenses"])
#    #request = Net::HTTP::Get.new(uri.path, 'Accept' => 'application/json')
#    #http =  Net::HTTP.new(uri.host, uri.port)
#    #response = http.start{|http| http.request(request)}
#    #json = JSON.parse(response.body)
#    lenses = []
#    #json["Lenses"]["lenses"].each {|lens|  lenses.push({ :name => lens["name"], :uri => lens["uri"], :description => lens["description"]})}
#    # TODO when all the lenses are tested and the list only contains ones that users will want to use then we can return to using the api call
#    lenses.push({
#            :name => "Stereochemistry",
#            :uri => "/QueryExpander/Lens/stereochemistry",
#            :description => "Default Lens plus the Stereochemistry linksets"
#    }) 
#    lenses.push({
#            :name => "Isotope",
#            :uri => "/QueryExpander/Lens/isotope",
#            :description => "Default Lens plus the Isotope linksets"
#    })
#    lenses.push({
#            :name => "Tautomer",
#            :uri => "/QueryExpander/Lens/tautomer",
#            :description => "Default Lens plus the Tautomer linksets"
#    })
#    lenses.push({
#            :name => "Default CW",
#            :uri => "/QueryExpander/Lens/DefaultCW",
#            :description => "Default Lens plus transitives via ConcepWiki"
#    })
#    lenses.push({
#            :name => "Default plus Charge",
#            :uri => "/QueryExpander/Lens/charge",
#            :description => "Default Lens plus the Charge linksets"
#    })


# No need for default, jsut have a button to reset the lens back to the default
#    lenses.push({
#            :name => "Default",
#            :uri => "/QueryExpander/Lens/Default",
#            :description => "The lens used by default in the Open PHACTS Discovery Platform"
#    })

#    respond_to do |format|
#      format.json {
#        render :json => lenses
#      }
#    end
#  end

  # Get the list of organisms for use in the filter
  # autocompleter
  def organisms
    query = params[:query]
    organisms = Rails.cache.fetch('org_' + params[:query], :expires_in => 6.months) { Organism.where(["label LIKE ?", "%#{params[:query]}%"]).limit(20) }.map do |organism|
	    {value: organism.label}
    end

    respond_to do |format|
      format.html
      format.xml { render :xml => organisms.to_xml }
      format.json {
        render :json => organisms.to_json
      }
    end
  end

#  # Given query params, a URI and total count of results download them all
#  # as a tsv file and return it. The download requests batches of 250 from
#  # the Linked Data API server using delayed job and the TsvFile model
#  def tab_separated_file
#    uuid = UUIDTools::UUID.random_create.to_s
#    tsv_file = TsvFile.new
#    tsv_file.save
#    tsv_file.update_attributes(:uuid => uuid)
#    tsv_file.process params
#    response = {"uuid" => uuid}
#    respond_to do |format|
#      format.json {
#        render :json => response
#      }
#    end
#  end

#  # Given a list of chemspider ids, grab the data about each
#  # id from the Linked Data API, create the tsv file and return it
#  def chemspider_tab_separated_file
#    uuid = UUIDTools::UUID.random_create.to_s
#    tsv_file = TsvFile.new
#    tsv_file.save
#    tsv_file.update_attributes(:uuid => uuid)
#    tsv_file.process_chemspider params
#    response = {"uuid" => uuid}
#    respond_to do |format|
#      format.json {
#        render :json => response
#      }
#    end
#  end

#  # How much of the tsv file has been created
#  # so far
#  def tsv_status
#    tsv_file = TsvFile.where(:uuid => params[:uuid]).first
#    status = tsv_file.status
#    percentage = tsv_file.percentage
#    response = {"status" => status, "percentage" => percentage}
#    respond_to do |format|
#      format.json {
#        render :json => response 
#      }
#    end
#  end

#  # Download a particular tsv file
#  def tsv_download
#    @tsv_file = TsvFile.where(:uuid => params[:uuid]).first
#    if @tsv_file.status == "finished" && @tsv_file.percentage == 100
#      send_file File.join(Rails.root, 'filestore', 'tsv', @tsv_file.uuid), :filename => 'output.tsv', :content_type => "text/tab-separated-values", :disposition => 'attachment', :stream => false
#    else
#      render :layout => false
#    end
#  end

end
