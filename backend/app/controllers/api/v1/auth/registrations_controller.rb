# frozen_string_literal: true

class Api::V1::Auth::RegistrationsController < ApplicationController
  def create
    user = User.new(sign_up_params)

    if user.save
      token = JsonwebToken.encode(sub: user.id)
      render json: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        },
        token: token,
        message: 'Signed up successfully'
      }, status: :created
    else
      render json: {
        message: 'User could not be created',
        errors: user.errors.full_messages,
        details: user.errors.details
      }, status: :unprocessable_entity
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :username)
  end
end