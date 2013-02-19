module Searcher

  class ConceptWikiResult

    include GeneralInit

    attr_accessor :match, :uuid, :ops_uri, :pref_label, :alt_labels, :pref_url, :type
    attr_writer :match, :uuid, :ops_uri, :pref_label, :alt_labels, :pref_url, :type

  end
end
