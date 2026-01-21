class ProblematicPostsController < ApplicationController
  before_action :set_post, only: %i[ confirm unconfirm ]

  # GET /problematic_posts
  def index
    @posts = Post.page(params[:page])
  end

  # PATCH /problematic_posts/:id/confirm
  # 問題再現用のconfirmアクション（statusをconfirmedに更新）
  def confirm

    if @post.status != 'confirmed'
      @post.update!(status: 'confirmed')
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
      end
      format.html { redirect_to problematic_posts_path }
    end
  end

  # PATCH /problematic_posts/:id/unconfirm
  # statusをunconfirmedに戻すアクション
  def unconfirm

    if @post.status != 'unconfirmed'
      @post.update!(status: 'unconfirmed')
    end

    respond_to do |format|
      format.turbo_stream do
        @posts = Post.page(params[:page])
      end
      format.html { redirect_to problematic_posts_path }
    end
  end

  private

  def set_post
    @post = Post.find(params[:id])
  end
end
