class TurboPostsController < ApplicationController
  before_action :set_post, only: %i[ confirm unconfirm ]

  # GET /turbo_posts
  def index
    @posts = Post.page(params[:page])
  end

  # PATCH /turbo_posts/:id/confirm
  # Turbo本来の思想：テーブル部分のみを更新し、ページネーションは更新対象外
  def confirm
    if @post.status != "confirmed"
      @post.update!(status: "confirmed")
      flash.now[:notice] = "✅ Post #{@post.id} が確認済みに更新されました"
    else
      flash.now[:alert] = "⚠️ Post #{@post.id} は既に確認済みです"
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
      end
      format.html { redirect_to turbo_posts_path }
    end
  end

  # PATCH /turbo_posts/:id/unconfirm
  # Turbo本来の思想：テーブル部分のみを更新し、ページネーションは更新対象外
  def unconfirm
    if @post.status != "unconfirmed"
      @post.update!(status: "unconfirmed")
      flash.now[:notice] = "🔄 Post #{@post.id} が未確認に戻されました"
    else
      flash.now[:alert] = "⚠️ Post #{@post.id} は既に未確認です"
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
      end
      format.html { redirect_to turbo_posts_path }
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end
end
