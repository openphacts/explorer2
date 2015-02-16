Explorer2::Application.routes.draw do

  root :to => 'home#index'

  match 'favourites' => 'home#index'

  match 'search' => 'home#index'

  match '404Response' => 'home#index'

  match '500Response' => 'home#index'

  match 'ErrorResponse' => 'home#index'

  match 'search/typeaheadCompounds' => 'search#typeaheadCompounds'

  match 'search/typeaheadTargets' => 'search#typeaheadTargets'

  match 'compounds' => 'home#index'
  match 'compounds/pharmacology' => 'home#index'
  match 'compounds/structure' => 'home#index'
  match 'compounds/pathways' => 'home#index'
  match 'compounds/draw' => 'home#index'
  match 'compounds/lens' => 'home#index'

  match 'targets' => 'home#index'
  match 'targets/pharmacology' => 'home#index'
  match 'targets/pathways' => 'home#index'
  match 'targets/diseases' => 'home#index'

  match 'trees' => 'home#index'
  match 'trees/pharmacology' => 'home#index'

  match 'pathways' => 'home#index'
  match 'pathways/compounds' => 'home#index'

  match 'diseases' => 'home#index'
  match 'diseases/targets' => 'home#index'

  resources :search, :only => [ :index ] do
    collection do
      get 'typeahead'
    end
  end

  resources :ketcher, :only => [ :index ] do
    collection do
      get :knocknock
      get :layout
    end
  end

  resources :core_api_calls, :except => [ :index, :show, :create, :new, :edit, :update, :destroy ] do
    collection do
      post :tab_separated_file
      get :tsv_download
      get :tsv_status
      get :organisms
#      get :lenses
      post :chemspider_tab_separated_file
    end
  end

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
