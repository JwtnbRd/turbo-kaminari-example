# frozen_string_literal: true

class Api::V1::BaseController < ApplicationController
  before_action :authenticate_user

  private

  def authenticate_user
    header = request.headers['Authorization']
    header = header.split(' ').last if header

    begin
      @decoded = JsonwebToken.decode(header)
      @current_user = User.find(@decoded[:sub])
    rescue JWT::DecodeError => e
      render json: { error: 'Invalid token' }, status: :unauthorized
    rescue ActiveRecord::RecordNotFound => e
      render json: { error: 'User not found' }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end