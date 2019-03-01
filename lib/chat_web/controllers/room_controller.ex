defmodule ChatWeb.RoomController do
  use ChatWeb, :controller

  alias Chat.Server
  alias Chat.Server.Room
  alias Chat.Auth.Authorizer

  plug ChatWeb.Plugs.AuthenticateUser when action not in [:index]
  plug :authorize_user when action in [:show, :edit, :update, :delete]

  defp rooms(conn) do
    if conn.assigns.user_signed_in? do
      user = Server.list_user_rooms(conn.assigns.current_user.id)
      rooms = user.rooms
    else
      rooms = Server.list_public_rooms()
    end
  end

  def index(conn, _params) do
    rooms = rooms(conn)  
    render(conn, "index.html", rooms: rooms)
  end

  def new(conn, _params) do
    changeset = Server.change_room(%Room{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"room" => room_params}) do
    #IO.inspect Server.create_room(conn.assigns.current_user, room_params)
    case Server.create_room(conn.assigns.current_user, room_params) do
      {:ok, room} ->
        conn
        |> put_flash(:info, "Room created successfully.")
        |> redirect(to: room_path(conn, :show, room))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    room = Server.get_room!(id)
    render(conn, "show.html", room: room)
  end

  def edit(conn, %{"id" => id}) do
    room = Server.get_room!(id)
    changeset = Server.change_room(room)
    subs = Server.get_subs!(id)
    render(conn, "edit.html", room: room, changeset: changeset, subs: subs)
  end

  def update(conn, %{"id" => id, "room" => room_params}) do
    room = Server.get_room!(id)

    case Server.update_room(room, room_params) do
      {:ok, room} ->
        conn
        |> put_flash(:info, "Room updated successfully.")
        |> redirect(to: room_path(conn, :show, room))
      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", room: room, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    room = Server.get_room!(id)
    {:ok, _room} = Server.delete_room(room)

    conn
    |> put_flash(:info, "Room deleted successfully.")
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
    %{params: %{"id" => room_id}} = conn
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
