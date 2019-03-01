defmodule ChatWeb.UserController do
    use ChatWeb, :controller
  
    alias Chat.Server
    alias Chat.Server.Room
    alias Chat.Auth.Authorizer
  
    plug ChatWeb.Plugs.AuthenticateUser when action in [:show]
  
    def show(conn, %{"id" => id}) do
      user = Server.get_user!(id)
      render(conn, "show.html", user: user)
    end
  
    defp authenticate_user(conn, _params) do
      if conn.assigns.user_signed_in? do
        conn
      else
        conn
        |> put_flash(:error, "You need to sign in or sign up before continuing.")
        |> redirect(to: session_path(conn, :new))
        |> halt()
      end
    end
  end
  