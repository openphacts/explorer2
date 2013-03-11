class ActiveRecord::Base
  after_create { |record| record.instance_variable_set(:@created, true) }

  def created?
    !!@created
  end
end
