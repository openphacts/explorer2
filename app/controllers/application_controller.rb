class ApplicationController < ActionController::Base
  protect_from_forgery

  # Overload handle_unverified_request to ensure that
  # exception is raised each time a request does not
  # pass validation.
  def handle_unverified_request
    raise(ActionController::InvalidAuthenticityToken)
  end
end
