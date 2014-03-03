class CreateTargets < ActiveRecord::Migration
  def up
   create_table :targets do |t|
      t.string :label
 
      t.timestamps
    end
  end

  def down
    drop_table :targets
  end
end
