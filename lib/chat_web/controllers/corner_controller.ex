defmodule ChatWeb.CornerController do
  use ChatWeb, :controller

  alias Chat.Server
  alias Chat.Server.Corner
  alias Chat.Auth.Authorizer

  require Logger

  plug ChatWeb.Plugs.AuthenticateUser when action not in [:index]
  plug :authorize_user when action in [:show, :edit, :update, :delete]

  def action(conn, _) do
    room = Server.get_room!(conn.params["room_id"])
    args = [conn, conn.params, room]
    apply(__MODULE__, action_name(conn), args)
  end
  
  def index(conn, _params, room) do
    render conn, "<h1><strong>404</strong> Not Built Yet :P</h1>"
  end

  def show(conn, %{"id" => id}, room) do
    corner = Server.get_corner!(room, id)
    render(conn, "show.html", corner: corner, room: room)
  end

  def new(conn, _params, room) do
    changeset =
    %Corner{room_id: room.id}
    |> Server.change_corner
    render(conn, "new.html", changeset: changeset, room: room)
  end

  def create(conn, %{"corner" => corner_params}, room) do
    IO.inspect corner_params
    corner_params =
    corner_params
    |> Map.put("room_id", room.id)
    #|> Map.put("corner_id", 56)
      
    IO.inspect corner_params
    case Server.create_corner(corner_params,  room) do
      {:ok, corner} ->
        conn
        |> put_flash(:info, "Corner created successfully.")
        |> redirect(to: room_corner_path(conn, :show, room, corner))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset, room: room)
    end
  end

  def edit(conn, %{"id" => id}, room) do
    corner = Server.get_corner(id)
    changeset = Server.change_corner(corner)
    render(conn, "edit.html", corner: corner, changeset: changeset, room: room)
  end

  def update(conn, %{"id" => id, "corner" => corner_params}, room) do
    corner = Server.get_corner(id)

    case Server.update_corner(corner, corner_params) do
      {:ok, corner} ->
        conn
        |> put_flash(:info, "corner updated successfully.")
        |> redirect(to: room_corner_path(conn, :show, room, corner))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html",corner: corner, changeset: changeset, room: room)
    end
  end

  def delete(conn, %{"id" => id}, room) do
    corner = Server.get_corner(id)
    {:ok, _room} = Server.delete_corner(corner)
    conn
    |> put_flash(:info, "Corner deleted successfully.")
    |> redirect(to: room_path(conn, :index))
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

  defp authorize_user(conn, _params) do
    %{params: %{"room_id" => room_id}} = conn
    room = Server.get_room!(room_id)
  
    if Authorizer.can_enter?(conn.assigns.current_user, room) do
      conn
    else
      conn
      |> put_flash(:error, "You are not authorized to access that page")
      |> redirect(to: room_path(conn, :index))
      |> halt()
    end
  end

end
  