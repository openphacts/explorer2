module Searcher
  class ConceptWikiSearcher

    def search query, branch, type
      domain = "ops.conceptwiki.org"
      path = "/web-ws/concept/search/byTag"
      params = "q=" + CGI::escape(query) + "&branch=" + branch + "&uuid=" + type + "&limit=10&start=0&page=1"
      url_path = "#{path}?".concat(params)
      response = Net::HTTP.get(domain, url_path)
      json = JSON.parse(response)
    end

    def parse_concepts json
      records = []
      json.each do |item|
        record = {}
        pref_label = ""
        alt_labels = []
        # iterating over labels to get preferred and alternative labels in relevant language
        item["labels"].each do |label|
          if label["language"]["code"] == "en"
            if label["type"] == "PREFERRED"
              pref_label = label["text"]
            end
            if label["type"] == "ALTERNATIVE"
              alt_labels.push(label["text"])
            end
          end
        end
        # iterating over tags to get the different tag uuid types and tag texts
        # iterating over urls to get first preferred url
        pref_url = ""
        item["urls"].each do |url|
          if url["type"] == "PREFERRED"
            pref_url = url["value"]
            break
          end
        end
        highlight = item["match"].gsub("<em>","").gsub("</em>","")
        # constructing the data record
        record = ConceptWikiResult.new(:match => highlight, :uuid => item["uuid"], :ops_uri => "http://www.conceptwiki.org/concept/" + item["uuid"],
          :pref_label => pref_label, :alt_labels => alt_labels.join("; "), :pref_url => pref_url, :type => "compound")
        
        records.push(record)
      end
      return records
    end

  end
end
