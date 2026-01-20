Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # API routes
  namespace :api do
    namespace :v1 do
      get "health", to: "health#index"

      # 認証ルート
      namespace :auth do
        post 'sign_up', to: 'registrations#create'
        post 'sign_in', to: 'sessions#create'
        delete 'sign_out', to: 'sessions#destroy'
        get 'me', to: 'sessions#me'
      end

      # 一般ユーザールート
      resources :trainings, only: [:index, :show]
      resources :training_records, only: [:index, :create, :show, :update, :destroy]

      # ユーザー統計ルート
      namespace :users do
        get :dashboard_stats
        get :training_trends
      end

      # ランキングルート
      namespace :rankings do
        get :points
        get :streaks
      end

      # 管理者ルート
      namespace :admin do
        resources :trainings
      end
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
