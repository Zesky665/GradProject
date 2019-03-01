defmodule Chat.Server do
  @moduledoc """
  The Server context.
  """

  import Ecto.{Changeset,Query}, warn: false
  alias Chat.Repo

  alias Chat.Server.{Room, Corner, Subscription}
  alias Chat.Auth.User

  require Logger

  @doc """
  Returns the list of rooms.

  ## Examples

      iex> list_rooms()
      [%Room{}, ...]

  """

  def list_rooms do
    Repo.all(Room)
  end

    @doc """
  Returns the list of public rooms.

  ## Examples

      iex> list_public_rooms()
      [%Room{}, ...]

  """

  def list_public_rooms do
    Room
    |> where([t], t.room_public == true)
    |> Repo.all()
  end

    @doc """
  Returns the list of user rooms.

  ## Examples

      iex> list_public_rooms()
      [%Room{}, ...]

  """

  def list_user_rooms(user_id) do
    User
    |> Repo.get!(user_id)
    |> Repo.preload(:rooms)
  end

  @doc """
  Gets a single room.

  Raises `Ecto.NoResultsError` if the Room does not exist.

  ## Examples

      iex> get_room!(123)
      %Room{}

      iex> get_room!(456)
      ** (Ecto.NoResultsError)

  """
  def get_room!(id) do 
    Room
    |>Repo.get!(id)
    |>Repo.preload(:corners)
    |>Repo.preload(:users)
  end

  @doc """
  Creates a room.

  ## Examples

      iex> create_room(%{field: value})
      {:ok, %Room{}}

      iex> create_room(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_room(user, attrs \\ %{}) do
    #Chat.Server.create_subscription(user.id,attrs.user_id)
    IO.inspect attrs
    IO.inspect user
   {:ok, room} = 
    user
    |> Ecto.build_assoc(:rooms)
    |> Room.changeset(Map.put(attrs,"user_id", user.id))
    |> Repo.insert()

    add_sub(user.id,room.id)
    #IO.inspect attrs
    #IO.inspect attrs["subscriptions"]
    add_subs(attrs["subscriptions"], room.id )
    {:ok, room}
  end

  @doc """
  Updates a room.

  ## Examples

      iex> update_room(room, %{field: new_value})
      {:ok, %Room{}}

      iex> update_room(room, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_room(%Room{} = room, attrs) do
    #IO.inspect attrs
    #IO.inspect room
    {:ok, room} = 
    room
    |> Room.changeset(attrs)
    |> Repo.update()

    update_subs(attrs["subscriptions"], room.id );
    
    {:ok, room}
  end

  @doc """
  Deletes a Room.

  ## Examples

      iex> delete_room(room)
      {:ok, %Room{}}

      iex> delete_room(room)
      {:error, %Ecto.Changeset{}}

  """
  def delete_room(%Room{} = room) do
    Repo.delete(room)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking room changes.

  ## Examples

      iex> change_room(room)
      %Ecto.Changeset{source: %Room{}}

  """
  def change_room(%Room{} = room) do
    Room.changeset(room, %{})
  end

  alias Chat.Server.Corner

  @doc """
  Returns the list of corners.

  ## Examples

      iex> list_corners()
      [%Corner{}, ...]

  """
  def list_corners do
    Repo.all(Corner)
  end

  @doc """
  Gets a single corner.

  Raises `Ecto.NoResultsError` if the Corner does not exist.

  ## Examples

      iex> get_corner!(123)
      %Corner{}

      iex> get_corner!(456)
      ** (Ecto.NoResultsError)

  """
  def get_corner!(room, id) do 
    Corner
    |> where([t], t.room_id == ^room.id)
    |> Repo.get!(id)
    |> Repo.preload(:room)
  end

  def get_corner(id) do
    Corner
    |> Repo.get!(id)
    |> Repo.preload(:room)
  end
  
  @doc """
  Creates a corner.

  ## Examples

      iex> create_corner(%{field: value})
      {:ok, %Corner{}}

      iex> create_corner(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_corner(attrs \\ %{}, room) do
    IO.inspect attrs
    %Corner{}
    |> corner_changeset(attrs)
    #|> cast_assoc(:rooms)
    #|> Corner.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a corner.

  ## Examples

      iex> update_corner(corner, %{field: new_value})
      {:ok, %Corner{}}

      iex> update_corner(corner, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_corner(%Corner{} = corner, attrs) do
    corner
    |> Corner.changeset(attrs)
    |> Repo.update()
  end
  
  @doc """
  Deletes a Corner.

  ## Examples

      iex> delete_corner(corner)
      {:ok, %Corner{}}

      iex> delete_corner(corner)
      {:error, %Ecto.Changeset{}}

  """
  def delete_corner(%Corner{} = corner) do
    Repo.delete(corner)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking corner changes.

  ## Examples

      iex> change_corner(corner)
      %Ecto.Changeset{source: %Corner{}}

  """
  def change_corner(%Corner{} = corner) do
    corner_changeset(corner, %{})
  end

  defp corner_changeset(%Corner{} = corner, attrs) do
    corner
    |> cast(attrs, [:corner_name, :room_id, :corner_type])
    |> validate_required([:corner_name, :room_id, :corner_type])
  end

  def add_sub(user, room) do
    Subscription.changeset(%Subscription{}, %{user_id: user, room_id: room})
    |> Repo.insert()
  end

  def add_subs(users, room) do
    Enum.each(String.split(users, ", "), &add_sub(&1, room))
  end

  def remove_sub(user, room) do
    Subscription
    |> Repo.get_by(user_id: user, room_id: room)
    |> Repo.delete()
  end

  def update_subs(users, room) do
    new_sub_list = Enum.map(String.split(users, ", "), fn(x) -> String.to_integer(x) end)
    curent_sub_list = get_subs(room)

    added_subs = new_sub_list -- curent_sub_list
    removed_subs = curent_sub_list -- new_sub_list

    Enum.each(added_subs, fn(x) -> add_sub(x, room) end)
    Enum.each(removed_subs, fn(x) -> remove_sub(x, room) end)
    {added_subs,removed_subs}
  end

  def get_subs(rid) do
    room = get_room!(rid)
    users = room.users
    Enum.map(users, fn(x) -> Map.get(x, :id) end)
  end

  def get_subs!(rid) do
    room = get_room!(rid)
    users = room.users
    Enum.map(users, fn(x) -> Map.get(x, :id) end) |> Enum.map_join(", ",&(&1))
  end

  def get_user!(id) do
    user = Repo.get_by(User, id: id)
  end
end
