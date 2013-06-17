Explorer2::Application.routes.draw do

  root :to => 'home#index'

  match 'search' => 'home#index'

  match 'search/typeahead' => 'search#typeahead'

#  match 'compounds' => 'home#index'

#  match 'compounds/:id' => 'home#index'

#  match 'compounds/:id/pharmacology' => 'home#index'

#  match 'compound/:id' => 'home#index'

#  match 'compound/:id/pharmacology' => 'home#index'

  resources :compounds, :only => :show do
    member do
      get 'pharmacology'
    end
  end

  resources :targets, :only => :show do
    member do
      get 'pharmacology'
    end
  end
  
  resources :enzymes,  :only => [ :show, :index ] do
    member do
      get 'pharmacology'
    end
  end

#  match 'targets' => 'home#index'

#  match 'targets/:id' => 'home#index'

#  match 'targets/:id/pharmacology' => 'home#index'

#  resources :search do
#    collection do
#      get 'compound_info'
#    end
#  end


  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
