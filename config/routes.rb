Rails.application.routes.draw do
  # 問題のあるページネーション（汚染される状態）
  resources :problematic_posts, only: [:index] do
    patch :confirm, on: :member
    patch :unconfirm, on: :member
  end

  # 解決済みページネーション（safe_params適用）
  resources :posts do
    patch :confirm, on: :member
    patch :unconfirm, on: :member
  end

  # Turbo本来の思想（テーブル部分のみ更新、ページネーションは更新対象外）
  resources :turbo_posts, only: [:index] do
    patch :confirm, on: :member
    patch :unconfirm, on: :member
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "posts#index"
end
