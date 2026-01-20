class Api::HealthController < ApplicationController
  def index
    render json: {
      status: "ok",
      message: "Backend server is running",
      timestamp: Time.current.iso8601
    }
  end
end
