# frozen_string_literal: true

class Api::V1::Auth::SessionsController < Api::V1::BaseController
  skip_before_action :authenticate_user, only: [:create, :destroy]
  
  def create
    user = User.find_by(email: params[:user][:email])

    if user && user.valid_password?(params[:user][:password])
      token = JsonwebToken.encode(sub: user.id)
      render json: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        },
        token: token,
        message: 'Logged in successfully'
      }, status: :ok
    else
      render json: {
        error: 'Invalid email or password'
      }, status: :unauthorized
    end
  end

  def destroy
    render json: {
      message: 'Logged out successfully'
    }, status: :ok
  end

  def me
    render json: {
      user: {
        id: current_user.id,
        email: current_user.email,
        username: current_user.username,
        role: current_user.role
      }
    }, status: :ok
  end
end