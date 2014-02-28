class CreateCompoundModel < ActiveRecord::Migration
  def up
   create_table :compounds do |t|
      t.string :label
 
      t.timestamps
    end
  end

  def down
    drop_table :compounds
  end
end
